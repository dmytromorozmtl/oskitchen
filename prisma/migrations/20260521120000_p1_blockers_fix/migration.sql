-- P1 blockers: webhook dedup, soft-delete, workspace billing link

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "deletion_requested_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "subscriptions_workspace_id_idx" ON "subscriptions"("workspace_id");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateIndex (dedup webhook events per connection)
CREATE UNIQUE INDEX IF NOT EXISTS "webhook_events_connection_id_external_event_id_key" ON "webhook_events"("connection_id", "external_event_id");
