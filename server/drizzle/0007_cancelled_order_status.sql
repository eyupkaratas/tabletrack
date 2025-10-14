ALTER TYPE "public"."order_status" ADD VALUE IF NOT EXISTS 'paid' BEFORE 'completed';
--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE IF NOT EXISTS 'cancelled' BEFORE 'closed';
--> statement-breakpoint
UPDATE "orders"
SET "order_status" = 'cancelled'
WHERE "order_status" = 'closed';
