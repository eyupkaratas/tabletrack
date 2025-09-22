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
}
