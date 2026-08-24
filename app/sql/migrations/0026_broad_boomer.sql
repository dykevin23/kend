ALTER TABLE "inquiries" DROP CONSTRAINT "inquiries_order_group_id_order_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "inquiries" DROP COLUMN "order_group_id";