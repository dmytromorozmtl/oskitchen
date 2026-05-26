-- Workspace Phase 5: external_products.workspace_id + batch workspace index

ALTER TABLE "external_products" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "external_products_workspace_id_created_at_idx"
  ON "external_products"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "channel_import_batches_workspace_id_created_at_idx"
  ON "channel_import_batches"("workspace_id", "created_at");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'external_products_workspace_id_fkey') THEN
    ALTER TABLE "external_products"
      ADD CONSTRAINT "external_products_workspace_id_fkey"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
