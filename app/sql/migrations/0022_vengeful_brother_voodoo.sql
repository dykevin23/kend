CREATE TABLE "entity_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"status" text NOT NULL,
	"snapshot" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "entity_status_history_entity_idx" ON "entity_status_history" USING btree ("entity_type","entity_id");