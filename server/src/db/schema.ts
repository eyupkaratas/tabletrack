import { sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'manager', 'waiter']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: roleEnum('role').notNull().default('waiter'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tableStatusEnum = pgEnum('table_status', ['available', 'active']);

export const tables = pgTable('tables', {
  id: uuid('id').defaultRandom().primaryKey(),
  number: integer('number').generatedByDefaultAsIdentity().notNull().unique(),
  status: tableStatusEnum('status').notNull().default('available'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    category: text('category'),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    nameUnique: uniqueIndex('products_name_unique').on(t.name),
  }),
);

export const orderStatus = pgEnum('order_status', ['open', 'closed']);
export const orderItemStatus = pgEnum('item_status', [
  'placed',
  'served',
  'cancelled',
]);

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  tableId: uuid('table_id')
    .references(() => tables.id)
    .notNull(),
  orderStatus: orderStatus('order_status').default('open').notNull(),
  openedByUserId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  closedAt: timestamp('closed_at'),
  total: numeric('total', { precision: 10, scale: 2 }).default('0'),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id)
    .notNull(),
  productId: uuid('product_id')
    .references(() => products.id)
    .notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  orderItemStatus: orderItemStatus('item_status').default('placed').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  servedAt: timestamp('served_at', { withTimezone: true }),
});

export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card']);

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id)
    .notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  method: paymentMethodEnum('method').notNull(),
  paidAt: timestamp('paid_at', { withTimezone: true }).default(sql`now()`),
});
