ALTER TABLE "children" ADD COLUMN "code" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_user_code_unique" UNIQUE("user_id","code");