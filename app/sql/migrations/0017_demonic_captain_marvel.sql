CREATE TYPE "public"."return_reason_type" AS ENUM('CHANGE_OF_MIND', 'DEFECT', 'WRONG_ITEM', 'DAMAGED', 'LOST');--> statement-breakpoint
CREATE TYPE "public"."shipping_fee_bearer" AS ENUM('SELLER', 'PLATFORM');--> statement-breakpoint
ALTER TYPE "public"."delivery_status" ADD VALUE 'returning';--> statement-breakpoint
ALTER TABLE "delivery_items" ADD COLUMN "reason" "return_reason_type";--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "shipping_fee_bearer" "shipping_fee_bearer" DEFAULT 'SELLER' NOT NULL;