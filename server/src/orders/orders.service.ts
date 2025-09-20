// src/orders/orders.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, inArray, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { orderItems, orders, products, tables, users } from 'src/db/schema';
import { OpenOrderDto } from './dto/open-order.dto';

@Injectable()
export class OrdersService {
  async open(dto: OpenOrderDto) {
    const { tableId, openedByUserId, items } = dto;

    if (!tableId || !openedByUserId)
      throw new BadRequestException('missing fields');
    if (!Array.isArray(items) || items.length === 0)
      throw new BadRequestException('items required');

    return await db.transaction(async (tx) => {
      // masa
      const [tbl] = await tx
        .select({ id: tables.id, number: tables.number })
        .from(tables)
        .where(eq(tables.id, tableId))
        .limit(1);
      if (!tbl) throw new NotFoundException('Table not found!');

      // kullanıcı
      const [usr] = await tx
        .select({ id: users.id })
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
        openedByUserId,
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
  }

  /* async viewTable(tableId: string) {
    // masa
    const [tbl] = await db
      .select({ id: tables.id, number: tables.number, status: tables.status })
      .from(tables)
      .where(eq(tables.id, tableId))
      .limit(1);
    if (!tbl) throw new NotFoundException('table not found');

    // masadaki tüm orderlar (açık+kapalı birlikte görmek istenirse burada filtre eklenir)
    const ords = await db
      .select({
        id: orders.id,
        status: orders.status,
        openedByUserId: orders.openedByUserId,
        createdAt: orders.createdAt,
        closedAt: orders.closedAt,
      })
      .from(orders)
      .where(eq(orders.tableId, tableId))
      .orderBy(sql`${orders.createdAt} DESC`);

    if (ords.length === 0) {
      return {
        tableId,
        tableNumber: tbl.number,
        tableStatus: tbl.status,
        aggregate: { items: [], total: '0', totalQty: 0 },
        orders: [],
      };
    }

    const orderIds = ords.map((o) => o.id);

    // itemlar (order bazında listelemek için)
    const itemRows = await db
      .select({
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        qty: orderItems.qty,
        unitPrice: orderItems.unitPrice, // string
        status: orderItems.status,
        productName: products.name,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orderItems.orderId, orderIds))
      .orderBy(sql`${orderItems.createdAt} ASC`);

    // order toplamları
    const orderTotals = await db
      .select({
        orderId: orderItems.orderId,
        totalQty: sql<number>`sum(${orderItems.qty})`,
        total: sql<string>`sum(${orderItems.qty} * ${orderItems.unitPrice})`,
      })
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds))
      .groupBy(orderItems.orderId);

    const totalsByOrder = new Map(orderTotals.map((t) => [t.orderId, t]));
    const itemsByOrder = new Map<string, any[]>();
    for (const r of itemRows) {
      const arr = itemsByOrder.get(r.orderId) ?? [];
      arr.push({
        productId: r.productId,
        productName: r.productName,
        qty: r.qty,
        unitPrice: r.unitPrice,
        status: r.status,
      });
      itemsByOrder.set(r.orderId, arr);
    }

    // ortak görünüm: tüm orderlardan ürün bazında topla
    const aggregated = await db
      .select({
        productId: orderItems.productId,
        productName: products.name,
        totalQty: sql<number>`sum(${orderItems.qty})`,
        subtotal: sql<string>`sum(${orderItems.qty} * ${orderItems.unitPrice})`,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orderItems.orderId, orderIds))
      .groupBy(orderItems.productId, products.name)
      .orderBy(sql`${products.name} ASC`);

    const [overall] = await db
      .select({
        totalQty: sql<number>`coalesce(sum(${orderItems.qty}), 0)`,
        total: sql<string>`coalesce(sum(${orderItems.qty} * ${orderItems.unitPrice}), '0')`,
      })
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    return {
      tableId,
      tableNumber: tbl.number,
      tableStatus: tbl.status,
      aggregate: {
        items: aggregated.map((a) => ({
          productId: a.productId,
          productName: a.productName,
          totalQty: a.totalQty,
          subtotal: a.subtotal, // string
        })),
        totalQty: overall.totalQty,
        total: overall.total, // string
      },
      orders: ords.map((o) => ({
        ...o,
        totalQty: totalsByOrder.get(o.id)?.totalQty ?? 0,
        total: totalsByOrder.get(o.id)?.total ?? '0',
        items: itemsByOrder.get(o.id) ?? [],
      })),
    };
  }*/
}
