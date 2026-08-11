ALTER TABLE "roadmap_milestones" ADD COLUMN "topic_details" text;--> statement-breakpoint
ALTER TABLE "roadmap_milestones" ADD COLUMN "example" text;--> statement-breakpoint
ALTER TABLE "roadmap_milestones" ADD COLUMN "interview_questions" jsonb DEFAULT '[]'::jsonb NOT NULL;