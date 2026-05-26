-- Workspace Phase 3: optional workspace_id on kitchen_customers (CRM)
-- Apply with: npx prisma migrate deploy (staging/prod) after sign-off

ALTER TABLE "kitchen_customers" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "kitchen_customers_workspace_id_created_at_idx"
  ON "kitchen_customers"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "kitchen_customers_workspace_id_status_idx"
  ON "kitchen_customers"("workspace_id", "status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'kitchen_customers_workspace_id_fkey'
  ) THEN
    ALTER TABLE "kitchen_customers"
      ADD CONSTRAINT "kitchen_customers_workspace_id_fkey"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
