ALTER TABLE "order_items" ALTER COLUMN "served_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "closed_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "closed_at" SET DEFAULT now();