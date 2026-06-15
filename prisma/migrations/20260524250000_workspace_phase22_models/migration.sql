-- Phase 22: nutrition, onboarding, operations, channels, org, packaging, packing

ALTER TABLE "nutrition_profiles" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "onboarding_calls" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "operations_audits" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "operations_checklists" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "order_channels" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "organization_members" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "packaging_items" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "packing_batches" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "packing_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "packing_scan_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "nutrition_profiles_workspace_id_idx" ON "nutrition_profiles"("workspace_id");
CREATE INDEX IF NOT EXISTS "onboarding_calls_workspace_id_idx" ON "onboarding_calls"("workspace_id");
CREATE INDEX IF NOT EXISTS "operations_audits_workspace_id_idx" ON "operations_audits"("workspace_id");
CREATE INDEX IF NOT EXISTS "operations_checklists_workspace_id_idx" ON "operations_checklists"("workspace_id");
CREATE INDEX IF NOT EXISTS "order_channels_workspace_id_idx" ON "order_channels"("workspace_id");
CREATE INDEX IF NOT EXISTS "organization_members_workspace_id_idx" ON "organization_members"("workspace_id");
CREATE INDEX IF NOT EXISTS "packaging_items_workspace_id_idx" ON "packaging_items"("workspace_id");
CREATE INDEX IF NOT EXISTS "packing_batches_workspace_id_idx" ON "packing_batches"("workspace_id");
CREATE INDEX IF NOT EXISTS "packing_events_workspace_id_idx" ON "packing_events"("workspace_id");
CREATE INDEX IF NOT EXISTS "packing_scan_events_workspace_id_idx" ON "packing_scan_events"("workspace_id");

DO $$ BEGIN ALTER TABLE "nutrition_profiles" ADD CONSTRAINT "nutrition_profiles_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "onboarding_calls" ADD CONSTRAINT "onboarding_calls_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "operations_audits" ADD CONSTRAINT "operations_audits_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "operations_checklists" ADD CONSTRAINT "operations_checklists_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "order_channels" ADD CONSTRAINT "order_channels_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "packaging_items" ADD CONSTRAINT "packaging_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "packing_batches" ADD CONSTRAINT "packing_batches_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "packing_events" ADD CONSTRAINT "packing_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "packing_scan_events" ADD CONSTRAINT "packing_scan_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
