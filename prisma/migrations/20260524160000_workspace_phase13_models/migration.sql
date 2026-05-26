-- Phase 13: workspace_id on 10 high-traffic tenant tables (nullable; backfill before NOT NULL)

ALTER TABLE "billing_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "usage_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "app_feedback" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "ingredients" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "notification_logs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "copilot_conversations" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "push_subscriptions" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "notification_rules" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "billing_events_workspace_id_created_at_idx" ON "billing_events"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "usage_events_workspace_id_created_at_idx" ON "usage_events"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "app_feedback_workspace_id_idx" ON "app_feedback"("workspace_id");
CREATE INDEX IF NOT EXISTS "ingredients_workspace_id_idx" ON "ingredients"("workspace_id");
CREATE INDEX IF NOT EXISTS "notification_logs_workspace_id_created_at_idx" ON "notification_logs"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "copilot_conversations_workspace_id_updated_at_idx" ON "copilot_conversations"("workspace_id", "updated_at");
CREATE INDEX IF NOT EXISTS "recipes_workspace_id_idx" ON "recipes"("workspace_id");
CREATE INDEX IF NOT EXISTS "push_subscriptions_workspace_id_idx" ON "push_subscriptions"("workspace_id");
CREATE INDEX IF NOT EXISTS "notification_rules_workspace_id_idx" ON "notification_rules"("workspace_id");
CREATE INDEX IF NOT EXISTS "suppliers_workspace_id_idx" ON "suppliers"("workspace_id");

DO $$ BEGIN
  ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "app_feedback" ADD CONSTRAINT "app_feedback_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "copilot_conversations" ADD CONSTRAINT "copilot_conversations_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "recipes" ADD CONSTRAINT "recipes_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "notification_rules" ADD CONSTRAINT "notification_rules_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
