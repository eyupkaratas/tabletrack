DO $$
BEGIN
  ALTER TYPE "public"."order_status" ADD VALUE IF NOT EXISTS 'paid' BEFORE 'completed';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  ALTER TYPE "public"."order_status" RENAME VALUE 'closed' TO 'cancelled';
EXCEPTION
  WHEN others THEN NULL;
END $$;
