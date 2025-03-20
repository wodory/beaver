CREATE TABLE "settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "type" text NOT NULL,
  "user_id" integer NOT NULL,
  "data" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "settings_type_user_id_idx" ON "settings" ("type", "user_id"); 