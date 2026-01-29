ALTER TABLE "orders" DROP CONSTRAINT "orders_seller_id_profiles_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_seller_id_admin_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."admin_sellers"("id") ON DELETE no action ON UPDATE no action;