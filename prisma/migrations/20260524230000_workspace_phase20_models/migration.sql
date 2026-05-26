-- Phase 20: tasks, labels, labor, lifecycle, locations, loyalty

ALTER TABLE "kitchen_tasks" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "kitchen_task_templates" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "label_templates" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "label_verification_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "labor_rates" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "lifecycle_emails" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "lifecycle_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "location_assignment_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "loyalty_accounts" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "kitchen_tasks_workspace_id_idx" ON "kitchen_tasks"("workspace_id");
CREATE INDEX IF NOT EXISTS "kitchen_task_templates_workspace_id_idx" ON "kitchen_task_templates"("workspace_id");
CREATE INDEX IF NOT EXISTS "label_templates_workspace_id_idx" ON "label_templates"("workspace_id");
CREATE INDEX IF NOT EXISTS "label_verification_events_workspace_id_idx" ON "label_verification_events"("workspace_id");
CREATE INDEX IF NOT EXISTS "labor_rates_workspace_id_idx" ON "labor_rates"("workspace_id");
CREATE INDEX IF NOT EXISTS "lifecycle_emails_workspace_id_idx" ON "lifecycle_emails"("workspace_id");
CREATE INDEX IF NOT EXISTS "lifecycle_events_workspace_id_idx" ON "lifecycle_events"("workspace_id");
CREATE INDEX IF NOT EXISTS "locations_workspace_id_idx" ON "locations"("workspace_id");
CREATE INDEX IF NOT EXISTS "location_assignment_events_workspace_id_idx" ON "location_assignment_events"("workspace_id");
CREATE INDEX IF NOT EXISTS "loyalty_accounts_workspace_id_idx" ON "loyalty_accounts"("workspace_id");

DO $$ BEGIN ALTER TABLE "kitchen_tasks" ADD CONSTRAINT "kitchen_tasks_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "kitchen_task_templates" ADD CONSTRAINT "kitchen_task_templates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "label_templates" ADD CONSTRAINT "label_templates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "label_verification_events" ADD CONSTRAINT "label_verification_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "labor_rates" ADD CONSTRAINT "labor_rates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "lifecycle_emails" ADD CONSTRAINT "lifecycle_emails_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "lifecycle_events" ADD CONSTRAINT "lifecycle_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "locations" ADD CONSTRAINT "locations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "location_assignment_events" ADD CONSTRAINT "location_assignment_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
