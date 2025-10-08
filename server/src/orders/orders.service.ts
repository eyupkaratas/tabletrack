import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { orderItems, orders, products, tables, users } from 'src/db/schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { OpenOrderDto } from './dto/open-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly notifications: NotificationsGateway) {}
  async getOpenCount(): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.orderStatus, 'open'));
    return row.count;
  }
  async findAll() {
    const ords = await db
      .select({
        id: orders.id,
        orderStatus: orders.orderStatus,
        createdAt: orders.createdAt,
        closedAt: orders.closedAt,
        openedByUserId: orders.openedByUserId,
        waiterName: users.name,
        tableId: orders.tableId,
        tableNumber: tables.number,
      })
      .from(orders)
      .leftJoin(users, eq(orders.openedByUserId, users.id))
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .orderBy(desc(orders.createdAt));

    if (!ords.length) {
      return [];
    }

    const ordIds = ords.map((o) => o.id);

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        status: orderItems.orderItemStatus,
        productName: products.name,
      })
      .from(orderItems)
      .where(inArray(orderItems.orderId, ordIds))
      .leftJoin(products, eq(products.id, orderItems.productId));

    const grouped = ords.map((ord) => ({
      ...ord,
      items: items.filter((it) => it.orderId === ord.id),
    }));

    const numbered = grouped.map((ord, index) => ({
      ...ord,
      orderNumber: grouped.length - index,
    }));

    return numbered;
  }

  async open(dto: OpenOrderDto) {
    const { tableId, openedByUserId, items } = dto;

    if (!tableId || !openedByUserId)
      throw new BadRequestException('missing fields');
    if (!Array.isArray(items) || items.length === 0)
      throw new BadRequestException('items required');

    // transaction ile order + items kaydı
    const result = await db.transaction(async (tx) => {
      // masa
      const [tbl] = await tx
        .select({ id: tables.id, number: tables.number })
        .from(tables)
        .where(eq(tables.id, tableId))
        .limit(1);
      if (!tbl) throw new NotFoundException('Table not found!');

      // kullanıcı
      const [usr] = await tx
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.id, openedByUserId))
        .limit(1);
      if (!usr) throw new NotFoundException('user not found!');

      // ürün fiyatları
      const ids = [...new Set(items.map((i) => i.productId))];
      const rows = ids.length
        ? await tx
            .select({
              id: products.id,
              name: products.name,
              price: products.price,
            })
            .from(products)
            .where(inArray(products.id, ids))
        : [];
      const priceMap = new Map(rows.map((r) => [r.id, r.price]));
      const nameMap = new Map(rows.map((r) => [r.id, r.name]));

      const missing = ids.filter((id) => !priceMap.has(id));
      if (missing.length)
        throw new BadRequestException(
          `Product not found: ${missing.join(',')}`,
        );

      for (const it of items) {
        if (!Number.isFinite(it.quantity) || it.quantity <= 0) {
          throw new BadRequestException(
            `Invalid quantity for product: ${it.productId}`,
          );
        }
      }

      // order
      const [ord] = await tx
        .insert(orders)
        .values({ tableId, openedByUserId, orderStatus: 'open' })
        .returning();

      // items
      const values = items.map((i) => ({
        orderId: ord.id,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: priceMap.get(i.productId)!,
        status: 'placed' as const,
      }));
      await tx.insert(orderItems).values(values);

      // total
      const [tot] = await tx
        .select({
          total: sql<string>`coalesce(sum(${orderItems.quantity} * ${orderItems.unitPrice}), '0')`,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, ord.id));
      await tx
        .update(orders)
        .set({ total: tot.total })
        .where(eq(orders.id, ord.id));

      // masa aktif
      await tx
        .update(tables)
        .set({ status: 'active' })
        .where(eq(tables.id, tableId));

      return {
        id: ord.id,
        tableId,
        waiterName: usr.name,
        tableNumber: tbl.number,
        status: 'open',
        createdAt: ord.createdAt,
        total: tot.total,
        items: values.map((v) => ({
          productId: v.productId,
          productName: nameMap.get(v.productId) ?? null,
          quantity: v.quantity,
          unitPrice: v.unitPrice,
          status: v.status,
        })),
      };
    });

    const openCount = await this.getOpenCount();
    this.notifications.sendOpenCount(openCount);

    return result;
  }
  async close(orderId: string) {
    // check order
    const [ord] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!ord) throw new NotFoundException('Order not found!');

    // close order
    await db
      .update(orders)
      .set({ orderStatus: 'closed', closedAt: new Date() })
      .where(eq(orders.id, orderId));

    // aktif sipariş sayısını güncelle ve frontende gönder
    const openCount = await this.getOpenCount();
    this.notifications.sendOpenCount(openCount);

    return { message: 'Order closed successfully', orderId };
  }

  async updateOrderItemStatus(
    orderItemId: string,
    status: 'placed' | 'served' | 'cancelled',
  ) {
    // check orderItem
    const [ordIt] = await db
      .select({ id: orderItems.id })
      .from(orderItems)
      .where(eq(orderItems.id, orderItemId))
      .limit(1);

    if (!ordIt) throw new NotFoundException('OrderItem not found!');
    // update orderItem status
    const [updated] = await db
      .update(orderItems)
      .set({ orderItemStatus: status })
      .where(eq(orderItems.id, orderItemId))
      .returning();
    return {
      message: 'OrderItem status updated successfully',
      orderItem: updated,
    };
  }
  async getWaiterDailyStats() {
    const result = await db
      .select({
        waiterName: users.name,
        date: sql<string>`DATE(${orders.createdAt})`.as('date'),
        orderCount: sql<number>`COUNT(${orders.id})`.as('orderCount'),
      })
      .from(orders)
      .leftJoin(users, eq(orders.openedByUserId, users.id))
      .groupBy(sql`DATE(${orders.createdAt})`, users.name)
      .orderBy(sql`DATE(${orders.createdAt})`);

    // Recharts'ın beklediği formata dönüştürelim:
    // [
    //   { date: "2025-10-01", Emre: 5, Ahmet: 8 },
    //   { date: "2025-10-02", Emre: 2, Ahmet: 4 },
    // ]

    const grouped: Record<string, Record<string, number>> = {};

    result.forEach((row) => {
      if (!grouped[row.date]) grouped[row.date] = {};
      grouped[row.date][row.waiterName!] = Number(row.orderCount);
    });

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      ...data,
    }));
  }
}
