CREATE TABLE "store_likes" (
	"user_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "store_likes_user_id_seller_id_pk" PRIMARY KEY("user_id","seller_id")
);
--> statement-breakpoint
ALTER TABLE "store_likes" ADD CONSTRAINT "store_likes_user_id_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_likes" ADD CONSTRAINT "store_likes_seller_id_admin_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."admin_sellers"("id") ON DELETE cascade ON UPDATE no action;