CREATE TYPE "public"."gender_type" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TABLE "child_growth" (
	"growth_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "child_growth_growth_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"child_id" bigint,
	"height" numeric(4, 1),
	"weight" numeric(4, 1),
	"head_circumference" numeric(3, 1),
	"recorded_at" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "children" (
	"child_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "children_child_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text,
	"nickname" text NOT NULL,
	"birthday" text NOT NULL,
	"gender" "gender_type" NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "child_growth" ADD CONSTRAINT "child_growth_child_id_children_child_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("child_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_parent_id_profiles_profile_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;