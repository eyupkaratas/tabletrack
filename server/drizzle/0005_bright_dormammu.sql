ALTER TYPE "public"."order_status" ADD VALUE 'completed' BEFORE 'closed';--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "served_at";