ALTER TABLE "reviews" DROP CONSTRAINT "reviews_user_id_product_id_unique";--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "delivery_item_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_delivery_item_id_delivery_items_id_fk" FOREIGN KEY ("delivery_item_id") REFERENCES "public"."delivery_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_delivery_item_id_unique" UNIQUE("delivery_item_id");