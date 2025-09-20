ALTER TABLE "order_items" RENAME COLUMN "qty" TO "quantity";--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "status" SET DEFAULT 'placed'::text;--> statement-breakpoint
DROP TYPE "public"."item_status";--> statement-breakpoint
CREATE TYPE "public"."item_status" AS ENUM('placed', 'served', 'cancelled');--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "status" SET DEFAULT 'placed'::"public"."item_status";--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "status" SET DATA TYPE "public"."item_status" USING "status"::"public"."item_status";--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "served_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" SET DEFAULT now();