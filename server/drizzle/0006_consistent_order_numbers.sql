CREATE SEQUENCE IF NOT EXISTS "orders_order_number_seq";

ALTER TABLE "orders" ADD COLUMN "order_number" integer;
ALTER TABLE "orders" ALTER COLUMN "order_number" SET DEFAULT nextval('orders_order_number_seq');
ALTER SEQUENCE "orders_order_number_seq" OWNED BY "orders"."order_number";

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM "orders"
)
UPDATE "orders" AS o
SET order_number = numbered.rn
FROM numbered
WHERE o.id = numbered.id;

WITH stats AS (
  SELECT 
    MAX(order_number) AS max_order_number,
    COUNT(*)          AS total_orders
  FROM "orders"
)
SELECT setval(
  'orders_order_number_seq',
  CASE WHEN total_orders = 0 THEN 1 ELSE max_order_number END,
  CASE WHEN total_orders = 0 THEN false ELSE true END
)
FROM stats;

ALTER TABLE "orders" ALTER COLUMN "order_number" SET NOT NULL;
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_number_unique" UNIQUE ("order_number");
