-- Phase 17: delivery fleet, entitlements, executive, data templates

ALTER TABLE "entitlement_overrides" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "delivery_dispatches" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "delivery_proofs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "doordash_deliveries" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "delivery_zones" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "delivery_slots" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "driver_profiles" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "data_templates" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "executive_snapshots" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "executive_insights" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "entitlement_overrides_workspace_id_idx" ON "entitlement_overrides"("workspace_id");
CREATE INDEX IF NOT EXISTS "delivery_dispatches_workspace_id_idx" ON "delivery_dispatches"("workspace_id");
CREATE INDEX IF NOT EXISTS "delivery_proofs_workspace_id_idx" ON "delivery_proofs"("workspace_id");
CREATE INDEX IF NOT EXISTS "doordash_deliveries_workspace_id_idx" ON "doordash_deliveries"("workspace_id");
CREATE INDEX IF NOT EXISTS "delivery_zones_workspace_id_idx" ON "delivery_zones"("workspace_id");
CREATE INDEX IF NOT EXISTS "delivery_slots_workspace_id_idx" ON "delivery_slots"("workspace_id");
CREATE INDEX IF NOT EXISTS "driver_profiles_workspace_id_idx" ON "driver_profiles"("workspace_id");
CREATE INDEX IF NOT EXISTS "data_templates_workspace_id_idx" ON "data_templates"("workspace_id");
CREATE INDEX IF NOT EXISTS "executive_snapshots_workspace_id_snapshot_date_idx" ON "executive_snapshots"("workspace_id", "snapshot_date");
CREATE INDEX IF NOT EXISTS "executive_insights_workspace_id_idx" ON "executive_insights"("workspace_id");

DO $$ BEGIN ALTER TABLE "entitlement_overrides" ADD CONSTRAINT "entitlement_overrides_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "delivery_dispatches" ADD CONSTRAINT "delivery_dispatches_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "delivery_proofs" ADD CONSTRAINT "delivery_proofs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "doordash_deliveries" ADD CONSTRAINT "doordash_deliveries_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "delivery_zones" ADD CONSTRAINT "delivery_zones_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "delivery_slots" ADD CONSTRAINT "delivery_slots_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "data_templates" ADD CONSTRAINT "data_templates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "executive_snapshots" ADD CONSTRAINT "executive_snapshots_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "executive_insights" ADD CONSTRAINT "executive_insights_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
