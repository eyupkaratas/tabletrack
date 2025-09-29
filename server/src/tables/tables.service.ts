// src/tables/tables.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { orderItems, orders, products, tables, users } from 'src/db/schema';

@Injectable()
export class TablesService {
  async findAll() {
    return db
      .select({
        id: tables.id,
        number: tables.number,
        status: tables.status,
        openOrdersCount: sql<number>`
        count(${orders.id}) 
        filter (where ${orders.orderStatus} = 'open')`.mapWith(Number),
      })
      .from(tables)
      .leftJoin(orders, eq(orders.tableId, tables.id))
      .groupBy(tables.id)
      .orderBy(asc(tables.number));
  }

  async findByNumber(number: number) {
    const [row] = await db
      .select()
      .from(tables)
      .where(eq(tables.number, number))
      .limit(1);
    if (!row) throw new NotFoundException('Bu numarayla masa yok');
    return row;
  }

  async createNext() {
    const [row] = await db
      .select({
        next: sql<number>`COALESCE(MAX(${tables.number}), 0) + 1`.mapWith(
          Number,
        ),
      })
      .from(tables);

    const next = row?.next ?? 1;

    try {
      const [created] = await db
        .insert(tables)
        .values({ number: next })
        .returning();
      return created;
    } catch (e: any) {
      if (e?.code === '23505') return this.createNext();
      throw e;
    }
  }

  async toggleStatusByNumber(number: number) {
    return db.transaction(async (tx) => {
      const [cur] = await tx
        .select()
        .from(tables)
        .where(eq(tables.number, number))
        .limit(1);
      if (!cur) throw new NotFoundException('Masa bulunamadı');

      const next = cur.status === 'available' ? 'active' : 'available';

      const [row] = await tx
        .update(tables)
        .set({ status: next })
        .where(eq(tables.id, cur.id))
        .returning();

      return row;
    });
  }

  async removeLast() {
    const [last] = await db
      .select()
      .from(tables)
      .orderBy(desc(tables.number))
      .limit(1);
    if (!last) throw new NotFoundException('Silinecek masa yok');
    if (last.status !== 'available')
      throw new BadRequestException('Masa aktifken silinemez');

    const [deleted] = await db
      .delete(tables)
      .where(eq(tables.id, last.id))
      .returning();
    if (!deleted) throw new NotFoundException('Masa bulunamadı');
    return { deletedNumber: last.number, deletedId: last.id };
  }

  async getTableWithOrders(number: number) {
    // masa
    const [tbl] = await db
      .select()
      .from(tables)
      .where(eq(tables.number, number))
      .limit(1);

    if (!tbl) throw new NotFoundException('Masa bulunamadı');

    // o masaya ait tüm orderlar
    const ords = await db
      .select({
        id: orders.id,
        orderStatus: orders.orderStatus,
        createdAt: orders.createdAt,
        closedAt: orders.closedAt,
        openedByUserId: orders.openedByUserId,
        waiterName: users.name,
      })
      .from(orders)
      .leftJoin(users, eq(orders.openedByUserId, users.id))
      .where(eq(orders.tableId, tbl.id))
      .orderBy(asc(orders.createdAt));

    if (!ords.length) {
      return { ...tbl, orders: [] };
    }

    // order idleri
    const ordIds = ords.map((o) => o.id);

    // itemler + ürün bilgileri
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

    // order bazlı gruplama
    const grouped: Record<string, any[]> = {};
    for (const it of items) {
      if (!grouped[it.orderId]) grouped[it.orderId] = [];
      grouped[it.orderId].push(it);
    }

    // orderlara itemleri ekle + total hesapla
    const enriched = ords.map((o) => {
      const its = grouped[o.id] ?? [];
      const total = its.reduce(
        (sum, i) => sum + Number(i.quantity) * Number(i.unitPrice),
        0,
      );
      return { ...o, items: its, total };
    });

    return { ...tbl, orders: enriched };
  }
}
