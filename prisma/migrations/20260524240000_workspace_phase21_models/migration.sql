-- Phase 21: loyalty, margin, meal plans, menus, notifications

ALTER TABLE "loyalty_programs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "margin_rules" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "meal_plans" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "meal_plan_templates" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "menu_channel_publishes" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "menu_rotation_rules" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "menu_templates" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "notification_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "notification_preferences" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "notification_templates" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "loyalty_programs_workspace_id_idx" ON "loyalty_programs"("workspace_id");
CREATE INDEX IF NOT EXISTS "margin_rules_workspace_id_idx" ON "margin_rules"("workspace_id");
CREATE INDEX IF NOT EXISTS "meal_plans_workspace_id_idx" ON "meal_plans"("workspace_id");
CREATE INDEX IF NOT EXISTS "meal_plan_templates_workspace_id_idx" ON "meal_plan_templates"("workspace_id");
CREATE INDEX IF NOT EXISTS "menu_channel_publishes_workspace_id_idx" ON "menu_channel_publishes"("workspace_id");
CREATE INDEX IF NOT EXISTS "menu_rotation_rules_workspace_id_idx" ON "menu_rotation_rules"("workspace_id");
CREATE INDEX IF NOT EXISTS "menu_templates_workspace_id_idx" ON "menu_templates"("workspace_id");
CREATE INDEX IF NOT EXISTS "notification_events_workspace_id_idx" ON "notification_events"("workspace_id");
CREATE INDEX IF NOT EXISTS "notification_preferences_workspace_id_idx" ON "notification_preferences"("workspace_id");
CREATE INDEX IF NOT EXISTS "notification_templates_workspace_id_idx" ON "notification_templates"("workspace_id");

DO $$ BEGIN ALTER TABLE "loyalty_programs" ADD CONSTRAINT "loyalty_programs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "margin_rules" ADD CONSTRAINT "margin_rules_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "meal_plan_templates" ADD CONSTRAINT "meal_plan_templates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "menu_channel_publishes" ADD CONSTRAINT "menu_channel_publishes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "menu_rotation_rules" ADD CONSTRAINT "menu_rotation_rules_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "menu_templates" ADD CONSTRAINT "menu_templates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "notification_events" ADD CONSTRAINT "notification_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
