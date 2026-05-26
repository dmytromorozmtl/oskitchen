-- Phase 15: workspace_id on kitchen, channels, costing, inventory, CRM, delivery, forecast, copilot

ALTER TABLE "kitchen_settings" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "channel_setup_progress" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "channel_retry_attempts" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "costing_runs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "inventory_stock" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "gift_cards" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "customer_segments" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "delivery_routes" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "forecast_runs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "copilot_settings" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "kitchen_settings_workspace_id_idx" ON "kitchen_settings"("workspace_id");
CREATE INDEX IF NOT EXISTS "channel_setup_progress_workspace_id_idx" ON "channel_setup_progress"("workspace_id");
CREATE INDEX IF NOT EXISTS "channel_retry_attempts_workspace_id_created_at_idx" ON "channel_retry_attempts"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "costing_runs_workspace_id_created_at_idx" ON "costing_runs"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "inventory_stock_workspace_id_idx" ON "inventory_stock"("workspace_id");
CREATE INDEX IF NOT EXISTS "gift_cards_workspace_id_idx" ON "gift_cards"("workspace_id");
CREATE INDEX IF NOT EXISTS "customer_segments_workspace_id_idx" ON "customer_segments"("workspace_id");
CREATE INDEX IF NOT EXISTS "delivery_routes_workspace_id_route_date_idx" ON "delivery_routes"("workspace_id", "route_date");
CREATE INDEX IF NOT EXISTS "forecast_runs_workspace_id_date_from_idx" ON "forecast_runs"("workspace_id", "date_from");
CREATE INDEX IF NOT EXISTS "copilot_settings_workspace_id_idx" ON "copilot_settings"("workspace_id");

DO $$ BEGIN ALTER TABLE "kitchen_settings" ADD CONSTRAINT "kitchen_settings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "channel_setup_progress" ADD CONSTRAINT "channel_setup_progress_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "channel_retry_attempts" ADD CONSTRAINT "channel_retry_attempts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "costing_runs" ADD CONSTRAINT "costing_runs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "customer_segments" ADD CONSTRAINT "customer_segments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "delivery_routes" ADD CONSTRAINT "delivery_routes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "forecast_runs" ADD CONSTRAINT "forecast_runs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "copilot_settings" ADD CONSTRAINT "copilot_settings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
