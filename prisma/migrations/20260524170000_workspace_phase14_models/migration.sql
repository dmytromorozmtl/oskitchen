-- Phase 14: workspace_id on analytics, activation, catering templates, channel rules

ALTER TABLE "cancellation_feedback" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "channel_import_rollbacks" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "activation_states" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "channel_fee_rules" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "allergen_profiles" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "catering_quote_templates" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "advisory_board_applications" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "analytics_snapshots" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "analytics_saved_views" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "analytics_alerts" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "cancellation_feedback_workspace_id_idx" ON "cancellation_feedback"("workspace_id");
CREATE INDEX IF NOT EXISTS "channel_import_rollbacks_workspace_id_idx" ON "channel_import_rollbacks"("workspace_id");
CREATE INDEX IF NOT EXISTS "activation_states_workspace_id_idx" ON "activation_states"("workspace_id");
CREATE INDEX IF NOT EXISTS "channel_fee_rules_workspace_id_idx" ON "channel_fee_rules"("workspace_id");
CREATE INDEX IF NOT EXISTS "allergen_profiles_workspace_id_idx" ON "allergen_profiles"("workspace_id");
CREATE INDEX IF NOT EXISTS "catering_quote_templates_workspace_id_idx" ON "catering_quote_templates"("workspace_id");
CREATE INDEX IF NOT EXISTS "advisory_board_applications_workspace_id_idx" ON "advisory_board_applications"("workspace_id");
CREATE INDEX IF NOT EXISTS "analytics_snapshots_workspace_id_snapshot_date_idx" ON "analytics_snapshots"("workspace_id", "snapshot_date");
CREATE INDEX IF NOT EXISTS "analytics_saved_views_workspace_id_idx" ON "analytics_saved_views"("workspace_id");
CREATE INDEX IF NOT EXISTS "analytics_alerts_workspace_id_idx" ON "analytics_alerts"("workspace_id");

DO $$ BEGIN
  ALTER TABLE "cancellation_feedback" ADD CONSTRAINT "cancellation_feedback_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "channel_import_rollbacks" ADD CONSTRAINT "channel_import_rollbacks_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "activation_states" ADD CONSTRAINT "activation_states_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "channel_fee_rules" ADD CONSTRAINT "channel_fee_rules_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "allergen_profiles" ADD CONSTRAINT "allergen_profiles_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "catering_quote_templates" ADD CONSTRAINT "catering_quote_templates_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "advisory_board_applications" ADD CONSTRAINT "advisory_board_applications_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "analytics_saved_views" ADD CONSTRAINT "analytics_saved_views_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "analytics_alerts" ADD CONSTRAINT "analytics_alerts_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
