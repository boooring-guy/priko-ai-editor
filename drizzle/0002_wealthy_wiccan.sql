CREATE TYPE "public"."export_status" AS ENUM('exporting', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."file_content_type" AS ENUM('text', 'binary');--> statement-breakpoint
CREATE TYPE "public"."file_type" AS ENUM('file', 'directory');--> statement-breakpoint
CREATE TYPE "public"."import_status" AS ENUM('importing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "files" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"project_id" text NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"parent_id" text,
	"content_type" "file_content_type" NOT NULL,
	"content" text,
	"file_type" "file_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"import_status" "import_status" DEFAULT 'importing' NOT NULL,
	"user_id" text NOT NULL,
	"export_status" "export_status" DEFAULT 'exporting' NOT NULL,
	"export_repo_url" text,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_config" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_config_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "is_banned" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "public_metadata" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "private_metadata" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_username" text;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_parent_id_files_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_config" ADD CONSTRAINT "user_config_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "by_project_id" ON "files" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "by_parent_id" ON "files" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "by_parent_project_id" ON "files" USING btree ("parent_id","project_id");--> statement-breakpoint
CREATE INDEX "by_owner_id" ON "projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_config_userId_idx" ON "user_config" USING btree ("user_id");