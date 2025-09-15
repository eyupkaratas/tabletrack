import { sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'manager', 'waiter']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: roleEnum('role').notNull().default('waiter'),
  createdAt: timestamp('created_at').default(sql`now()`),
});

export const tableStatusEnum = pgEnum('table_status', [
  'available',
  'occupied',
  'paid',
]);

export const tables = pgTable('tables', {
  id: uuid('id').defaultRandom().primaryKey(),
  number: integer('number').notNull(),
  name: text('name'),
  status: tableStatusEnum('status').notNull().default('available'),
  createdAt: timestamp('created_at').default(sql`now()`),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  category: text('category'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').default(sql`now()`),
});

export const orderStatusEnum = pgEnum('order_status', ['open', 'closed']);

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  tableId: uuid('table_id')
    .references(() => tables.id)
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  status: orderStatusEnum('status').notNull().default('open'),
  createdAt: timestamp('created_at').default(sql`now()`),
  closedAt: timestamp('closed_at'),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id)
    .notNull(),
  productId: uuid('product_id')
    .references(() => products.id)
    .notNull(),
  quantity: integer('quantity').notNull().default(1),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
});

export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card']);

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id)
    .notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  method: paymentMethodEnum('method').notNull(),
  paidAt: timestamp('paid_at').default(sql`now()`),
});
