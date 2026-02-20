ALTER TABLE "user" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "public_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "private_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");