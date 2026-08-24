CREATE TYPE "public"."inquiry_category" AS ENUM('DELIVERY', 'PRODUCT', 'PAYMENT', 'ETC');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('pending', 'answered');--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"order_group_id" uuid,
	"category" "inquiry_category" NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"status" "inquiry_status" DEFAULT 'pending' NOT NULL,
	"answer" text,
	"answered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_user_id_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_order_group_id_order_groups_id_fk" FOREIGN KEY ("order_group_id") REFERENCES "public"."order_groups"("id") ON DELETE set null ON UPDATE no action;