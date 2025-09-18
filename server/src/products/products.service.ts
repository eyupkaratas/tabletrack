import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, ilike, SQL } from 'drizzle-orm';
import { db } from 'src/db';
import { products } from '../db/schema';
import { CreateProductDto } from './dto/create-product.dto';

type FindFilters = {
  category?: string;
  name?: string;
  price?: string;
};

@Injectable()
export class ProductsService {
  async find(filters: FindFilters) {
    const conds: (SQL | undefined)[] = [];

    if (filters.category) {
      conds.push(eq(products.category, filters.category));
    }

    if (filters.name) {
      conds.push(ilike(products.name, `%${filters.name}%`));
    }

    if (filters.price) {
      const p = Number(filters.price);
      if (!Number.isFinite(p)) {
      } else {
        conds.push(eq(products.price, p.toFixed(2)));
      }
    }

    const where = conds.length ? and(...conds) : undefined;

    return db.select().from(products).where(where).limit(200);
  }

  async findOne(id: string) {
    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!row) throw new NotFoundException('Product not found');
    return row;
  }

  async create(payload: CreateProductDto) {
    const [created] = await db
      .insert(products)
      .values({ ...payload, price: payload.price.toString() })
      .onConflictDoNothing({ target: products.name })
      .returning();
    if (!created)
      throw new ConflictException(
        'A product with the same name already exists.',
      );
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
