CREATE TYPE "public"."event_type" AS ENUM('product_view');--> statement-breakpoint
CREATE TABLE "events" (
	"event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" "event_type",
	"event_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "stats" jsonb DEFAULT '{"views":0,"chats":0,"likes":0}'::jsonb NOT NULL;