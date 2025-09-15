import { Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import { db } from 'src/db';
import { users } from '../db/schema'; // tek schema.ts kullandığın için buradan import

@Injectable()
export class UsersService {
  async findAll() {
    return db.select().from(users);
  }

  async findOne(id: string) {
    const [u] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async create(payload: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'manager' | 'waiter';
  }) {
    const hashed = await bcrypt.hash(payload.password, 10);
    const [created] = await db
      .insert(users)
      .values({ ...payload, password: hashed })
      .returning();
    return created;
  }

  async update(
    id: string,
    changes: Partial<{
      name: string;
      email: string;
      password: string;
      role: 'admin' | 'manager' | 'waiter';
    }>,
  ) {
    if (changes.password) {
      changes.password = await bcrypt.hash(changes.password, 10);
    }
    const [updated] = await db
      .update(users)
      .set(changes)
      .where(eq(users.id, id))
      .returning();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async remove(id: string) {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    if (!deleted) throw new NotFoundException('User not found');
    return deleted;
  }
}
