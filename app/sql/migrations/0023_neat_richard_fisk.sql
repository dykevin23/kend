ALTER TABLE "delivery_items" ADD COLUMN "purchase_confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "purchase_confirmed_at";