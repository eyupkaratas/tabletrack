CREATE TYPE "public"."item_status" AS ENUM('placed', 'preparing', 'served', 'cancelled');--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "closed_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "closed_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "closed_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "qty" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "unit_price" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "status" "item_status" DEFAULT 'placed' NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "served_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "total" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "quantity";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "price";