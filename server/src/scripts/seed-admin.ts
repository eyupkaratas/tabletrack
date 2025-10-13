import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { db, pool } from '../db';
import { users } from '../db/schema';

const ADMIN_EMAIL = 'admin@tabletrack.dev';
const DEFAULT_PASSWORD = 'admin';

async function ensureAdmin() {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);

  if (existing) {
    console.log(`Admin user already exists for ${ADMIN_EMAIL}`);
    return;
  }

  const plainPassword = process.env.ADMIN_SEED_PASSWORD ?? DEFAULT_PASSWORD;
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await db
    .insert(users)
    .values({
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    })
    .returning();

  console.log(`Admin user created for ${ADMIN_EMAIL}`);
  if (!process.env.ADMIN_SEED_PASSWORD) {
    console.log(`Temporary password: ${plainPassword}`);
  }
}

ensureAdmin()
  .catch((err) => {
    console.error('Failed to ensure admin user:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
