CREATE TYPE "public"."notification_type" AS ENUM('order_paid', 'order_shipped', 'order_delivered', 'order_cancelled', 'order_refunded', 'return_approved', 'inquiry_answered');--> statement-breakpoint
CREATE TYPE "public"."push_status" AS ENUM('pending', 'sending', 'sent', 'failed', 'skipped', 'no_device');--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"order_updates" boolean DEFAULT true NOT NULL,
	"inquiry_updates" boolean DEFAULT true NOT NULL,
	"marketing" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"url" text,
	"push_status" "push_status" DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"claimed_at" timestamp with time zone,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "push_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"platform" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "push_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_user_id_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "notifications_pending_idx" ON "notifications" USING btree ("created_at") WHERE "notifications"."push_status" in ('pending', 'sending');--> statement-breakpoint
CREATE INDEX "push_tokens_user_idx" ON "push_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "notification_settings_select_own" ON "notification_settings" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("notification_settings"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "notification_settings_insert_own" ON "notification_settings" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("notification_settings"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "notification_settings_update_own" ON "notification_settings" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("notification_settings"."user_id" = (select auth.uid())) WITH CHECK ("notification_settings"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "notifications_select_own" ON "notifications" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("notifications"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "notifications_update_own" ON "notifications" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("notifications"."user_id" = (select auth.uid())) WITH CHECK ("notifications"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "push_tokens_select_own" ON "push_tokens" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("push_tokens"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "push_tokens_delete_own" ON "push_tokens" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("push_tokens"."user_id" = (select auth.uid()));