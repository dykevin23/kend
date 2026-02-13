CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_group_id" uuid NOT NULL,
	"payment_key" text NOT NULL,
	"order_id" text NOT NULL,
	"method" text,
	"status" text NOT NULL,
	"total_amount" integer NOT NULL,
	"requested_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"card_issuer_code" text,
	"card_acquirer_code" text,
	"card_number" text,
	"card_installment_plan_months" integer,
	"card_approve_no" text,
	"card_type" text,
	"card_owner_type" text,
	"easy_pay_provider" text,
	"easy_pay_amount" integer,
	"easy_pay_discount_amount" integer,
	"receipt_url" text,
	"raw_response" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_payment_key_unique" UNIQUE("payment_key")
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_group_id_order_groups_id_fk" FOREIGN KEY ("order_group_id") REFERENCES "public"."order_groups"("id") ON DELETE cascade ON UPDATE no action;