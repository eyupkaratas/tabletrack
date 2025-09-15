import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { db } from 'src/db';
import { users } from '../db/schema';

const withoutPassword = <T extends { password?: unknown }>(u: T) => {
  const { password, ...rest } = u as any;
  return rest;
};

@Injectable()
export class UsersService {
  async findAll() {
    const rows = await db.select().from(users);
    return rows.map(withoutPassword); // ← sadece burada değişti
  }

  async findOne(id: string) {
    const [u] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!u) throw new NotFoundException('User not found');
    return withoutPassword(u); // ← burada
  }

  // Auth için password lazım olduğundan olduğu gibi kalsın
  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email));
    // console.log('DEBUG findByEmail result:', result);
    return result[0] ?? null;
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
    return withoutPassword(created); // ← burada
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
    return withoutPassword(updated); // ← burada
  }

  async remove(id: string) {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    if (!deleted) throw new NotFoundException('User not found');
    return withoutPassword(deleted); // ← burada
  }
}
