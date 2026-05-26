-- Phase 16: copilot CRM + costing snapshots + customer lifecycle

ALTER TABLE "customer_feedback" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "customer_health_snapshots" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "cost_snapshots" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "customer_merge_candidates" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "customer_follow_ups" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "customer_subscriptions" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "customer_merge_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "copilot_insights" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "copilot_action_drafts" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "copilot_audit_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "customer_feedback_workspace_id_created_at_idx" ON "customer_feedback"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "customer_health_snapshots_workspace_id_created_at_idx" ON "customer_health_snapshots"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "cost_snapshots_workspace_id_idx" ON "cost_snapshots"("workspace_id");
CREATE INDEX IF NOT EXISTS "customer_merge_candidates_workspace_id_idx" ON "customer_merge_candidates"("workspace_id");
CREATE INDEX IF NOT EXISTS "customer_follow_ups_workspace_id_idx" ON "customer_follow_ups"("workspace_id");
CREATE INDEX IF NOT EXISTS "customer_subscriptions_workspace_id_idx" ON "customer_subscriptions"("workspace_id");
CREATE INDEX IF NOT EXISTS "customer_merge_events_workspace_id_created_at_idx" ON "customer_merge_events"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "copilot_insights_workspace_id_created_at_idx" ON "copilot_insights"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "copilot_action_drafts_workspace_id_idx" ON "copilot_action_drafts"("workspace_id");
CREATE INDEX IF NOT EXISTS "copilot_audit_events_workspace_id_created_at_idx" ON "copilot_audit_events"("workspace_id", "created_at");

DO $$ BEGIN ALTER TABLE "customer_feedback" ADD CONSTRAINT "customer_feedback_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "customer_health_snapshots" ADD CONSTRAINT "customer_health_snapshots_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "cost_snapshots" ADD CONSTRAINT "cost_snapshots_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "customer_merge_candidates" ADD CONSTRAINT "customer_merge_candidates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "customer_follow_ups" ADD CONSTRAINT "customer_follow_ups_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "customer_subscriptions" ADD CONSTRAINT "customer_subscriptions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "customer_merge_events" ADD CONSTRAINT "customer_merge_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "copilot_insights" ADD CONSTRAINT "copilot_insights_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "copilot_action_drafts" ADD CONSTRAINT "copilot_action_drafts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "copilot_audit_events" ADD CONSTRAINT "copilot_audit_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
