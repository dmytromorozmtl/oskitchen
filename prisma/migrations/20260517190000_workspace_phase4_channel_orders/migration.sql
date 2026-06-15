-- Workspace Phase 4: optional workspace_id on external_orders, channel_conflicts, channel_sync_jobs

ALTER TABLE "external_orders" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "channel_conflicts" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "channel_sync_jobs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "external_orders_workspace_id_created_at_idx"
  ON "external_orders"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "channel_conflicts_workspace_id_status_idx"
  ON "channel_conflicts"("workspace_id", "status");
CREATE INDEX IF NOT EXISTS "channel_sync_jobs_workspace_id_started_at_idx"
  ON "channel_sync_jobs"("workspace_id", "started_at");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'external_orders_workspace_id_fkey') THEN
    ALTER TABLE "external_orders"
      ADD CONSTRAINT "external_orders_workspace_id_fkey"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'channel_conflicts_workspace_id_fkey') THEN
    ALTER TABLE "channel_conflicts"
      ADD CONSTRAINT "channel_conflicts_workspace_id_fkey"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'channel_sync_jobs_workspace_id_fkey') THEN
    ALTER TABLE "channel_sync_jobs"
      ADD CONSTRAINT "channel_sync_jobs_workspace_id_fkey"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
