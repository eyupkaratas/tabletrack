ALTER TABLE "order_items" RENAME COLUMN "status" TO "item_status";--> statement-breakpoint
ALTER TABLE "orders" RENAME COLUMN "status" TO "order_status";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "paid_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "paid_at" SET DEFAULT now();