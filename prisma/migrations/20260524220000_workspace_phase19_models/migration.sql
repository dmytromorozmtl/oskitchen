-- Phase 19: import, ingredients demand/lots, inventory count, invoices, IoT, module prefs

ALTER TABLE "import_mapping_templates" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "ingredient_declarations" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "ingredient_demand_lines" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "ingredient_demand_runs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "ingredient_lots" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "ingredient_substitutions" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "inventory_counts" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "invoice_records" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "iot_sensor_devices" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "kitchen_module_preferences" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "import_mapping_templates_workspace_id_idx" ON "import_mapping_templates"("workspace_id");
CREATE INDEX IF NOT EXISTS "ingredient_declarations_workspace_id_idx" ON "ingredient_declarations"("workspace_id");
CREATE INDEX IF NOT EXISTS "ingredient_demand_lines_workspace_id_idx" ON "ingredient_demand_lines"("workspace_id");
CREATE INDEX IF NOT EXISTS "ingredient_demand_runs_workspace_id_idx" ON "ingredient_demand_runs"("workspace_id");
CREATE INDEX IF NOT EXISTS "ingredient_lots_workspace_id_idx" ON "ingredient_lots"("workspace_id");
CREATE INDEX IF NOT EXISTS "ingredient_substitutions_workspace_id_idx" ON "ingredient_substitutions"("workspace_id");
CREATE INDEX IF NOT EXISTS "inventory_counts_workspace_id_idx" ON "inventory_counts"("workspace_id");
CREATE INDEX IF NOT EXISTS "invoice_records_workspace_id_idx" ON "invoice_records"("workspace_id");
CREATE INDEX IF NOT EXISTS "iot_sensor_devices_workspace_id_idx" ON "iot_sensor_devices"("workspace_id");
CREATE INDEX IF NOT EXISTS "kitchen_module_preferences_workspace_id_idx" ON "kitchen_module_preferences"("workspace_id");

DO $$ BEGIN ALTER TABLE "import_mapping_templates" ADD CONSTRAINT "import_mapping_templates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ingredient_declarations" ADD CONSTRAINT "ingredient_declarations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ingredient_demand_lines" ADD CONSTRAINT "ingredient_demand_lines_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ingredient_demand_runs" ADD CONSTRAINT "ingredient_demand_runs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ingredient_lots" ADD CONSTRAINT "ingredient_lots_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ingredient_substitutions" ADD CONSTRAINT "ingredient_substitutions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "inventory_counts" ADD CONSTRAINT "inventory_counts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "invoice_records" ADD CONSTRAINT "invoice_records_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "iot_sensor_devices" ADD CONSTRAINT "iot_sensor_devices_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "kitchen_module_preferences" ADD CONSTRAINT "kitchen_module_preferences_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
