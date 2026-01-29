CREATE TYPE "public"."payment_method_type" AS ENUM('bank_transfer', 'credit_card', 'mobile_payment', 'easy_pay', 'virtual_account');--> statement-breakpoint
ALTER TABLE "order_groups" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order_groups" ALTER COLUMN "status" SET DEFAULT 'payment_in_progress'::text;--> statement-breakpoint
UPDATE "order_groups" SET "status" = 'payment_pending' WHERE "status" = 'pending';--> statement-breakpoint
DROP TYPE "public"."order_group_status";--> statement-breakpoint
CREATE TYPE "public"."order_group_status" AS ENUM('payment_in_progress', 'payment_pending', 'paid', 'partially_refunded', 'refunded', 'cancelled', 'failed');--> statement-breakpoint
ALTER TABLE "order_groups" ALTER COLUMN "status" SET DEFAULT 'payment_in_progress'::"public"."order_group_status";--> statement-breakpoint
ALTER TABLE "order_groups" ALTER COLUMN "status" SET DATA TYPE "public"."order_group_status" USING "status"::"public"."order_group_status";--> statement-breakpoint
ALTER TABLE "order_groups" ALTER COLUMN "payment_method" SET DATA TYPE "public"."payment_method_type" USING "payment_method"::"public"."payment_method_type";
