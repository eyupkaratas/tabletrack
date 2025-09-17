import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from 'src/db';
import { products } from '../db/schema';

@Injectable()
export class ProductsService {
  async findAll() {
    const rows = await db.select().from(products);
    return rows;
  }

  async findOne(id: string) {
    const [p] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!p) throw new NotFoundException('Product not found');
    return [p];
  }
  async findByName(name: string) {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.name, name))
      .limit(1);
    if (!result)
      throw new NotFoundException(
        'Product with the given name does not exist.',
      );
    return result;
  }
  async findByCategory(category: string) {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.category, category));
    if (!category)
      throw new NotFoundException(
        'Category with the given name does not exist',
      );
    return result;
  }

  async create(payload: { name: string; category: string; price; number }) {
    const [created] = await db
      .insert(products)
      .values({ ...payload })
      .returning();
    return [created];
  }
  async update(
    id: string,
    changes: Partial<{
      name: string;
      category: string;
      price: number;
    }>,
  ) {
    const dbChanges: any = { ...changes };
    if (dbChanges.price !== undefined) {
      dbChanges.price = dbChanges.price.toString();
    }
    const [updated] = await db
      .update(products)
      .set(dbChanges)
      .where(eq(products.id, id))
      .returning();
    if (!updated) throw new NotFoundException('Product not found');
    return updated;
  }
  async remove(id: string) {
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    if (!deleted) throw new NotFoundException('Product not found');
    return deleted;
  }
}
