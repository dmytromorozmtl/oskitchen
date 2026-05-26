-- Phase 18: food safety, franchise, go-live, grubhub, holiday, implementation

ALTER TABLE "food_safety_checklists" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "food_safety_audits" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "food_safety_corrective_actions" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "franchises" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "go_live_projects" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "go_live_test_runs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "grubhub_deliveries" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "holiday_packages" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "holiday_package_orders" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "implementation_projects" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "food_safety_checklists_workspace_id_idx" ON "food_safety_checklists"("workspace_id");
CREATE INDEX IF NOT EXISTS "food_safety_audits_workspace_id_idx" ON "food_safety_audits"("workspace_id");
CREATE INDEX IF NOT EXISTS "food_safety_corrective_actions_workspace_id_idx" ON "food_safety_corrective_actions"("workspace_id");
CREATE INDEX IF NOT EXISTS "franchises_workspace_id_idx" ON "franchises"("workspace_id");
CREATE INDEX IF NOT EXISTS "go_live_projects_workspace_id_idx" ON "go_live_projects"("workspace_id");
CREATE INDEX IF NOT EXISTS "go_live_test_runs_workspace_id_idx" ON "go_live_test_runs"("workspace_id");
CREATE INDEX IF NOT EXISTS "grubhub_deliveries_workspace_id_idx" ON "grubhub_deliveries"("workspace_id");
CREATE INDEX IF NOT EXISTS "holiday_packages_workspace_id_idx" ON "holiday_packages"("workspace_id");
CREATE INDEX IF NOT EXISTS "holiday_package_orders_workspace_id_idx" ON "holiday_package_orders"("workspace_id");
CREATE INDEX IF NOT EXISTS "implementation_projects_workspace_id_idx" ON "implementation_projects"("workspace_id");

DO $$ BEGIN ALTER TABLE "food_safety_checklists" ADD CONSTRAINT "food_safety_checklists_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "food_safety_audits" ADD CONSTRAINT "food_safety_audits_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "food_safety_corrective_actions" ADD CONSTRAINT "food_safety_corrective_actions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "franchises" ADD CONSTRAINT "franchises_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "go_live_projects" ADD CONSTRAINT "go_live_projects_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "go_live_test_runs" ADD CONSTRAINT "go_live_test_runs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "grubhub_deliveries" ADD CONSTRAINT "grubhub_deliveries_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "holiday_packages" ADD CONSTRAINT "holiday_packages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "holiday_package_orders" ADD CONSTRAINT "holiday_package_orders_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "implementation_projects" ADD CONSTRAINT "implementation_projects_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
