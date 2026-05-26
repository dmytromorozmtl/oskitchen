-- Workspace Phase 6: product_mappings.workspace_id

ALTER TABLE "product_mappings" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "product_mappings_workspace_id_created_at_idx"
  ON "product_mappings"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "product_mappings_workspace_id_status_idx"
  ON "product_mappings"("workspace_id", "status");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_mappings_workspace_id_fkey') THEN
    ALTER TABLE "product_mappings"
      ADD CONSTRAINT "product_mappings_workspace_id_fkey"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
