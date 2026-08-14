ALTER TABLE "delivery_items" ADD COLUMN "return_approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "delivery_items" ADD COLUMN "return_received_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "delivery_items" ADD COLUMN "reject_reason" text;