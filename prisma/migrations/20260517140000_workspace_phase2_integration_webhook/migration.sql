-- Workspace Phase 2: integration_connections + webhook_events
ALTER TABLE "integration_connections" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "webhook_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "integration_connections_workspace_id_idx" ON "integration_connections"("workspace_id");
CREATE INDEX IF NOT EXISTS "integration_connections_workspace_id_provider_idx" ON "integration_connections"("workspace_id", "provider");
CREATE INDEX IF NOT EXISTS "webhook_events_workspace_id_idx" ON "webhook_events"("workspace_id");
CREATE INDEX IF NOT EXISTS "webhook_events_workspace_id_received_at_idx" ON "webhook_events"("workspace_id", "received_at");

DO $$ BEGIN
  ALTER TABLE "integration_connections" ADD CONSTRAINT "integration_connections_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
