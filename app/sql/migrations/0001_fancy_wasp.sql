CREATE TYPE "public"."role" AS ENUM('customer', 'seller', 'administrator');--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "role" "role" DEFAULT 'customer' NOT NULL;