ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "daily_generation_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_generation_date" date;
