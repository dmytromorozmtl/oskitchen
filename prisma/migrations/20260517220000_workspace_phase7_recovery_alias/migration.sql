-- Workspace Phase 7: product_mapping_aliases.workspace_id (error_recovery_items already has column)

ALTER TABLE "product_mapping_aliases" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "product_mapping_aliases_workspace_id_created_at_idx"
  ON "product_mapping_aliases"("workspace_id", "created_at");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_mapping_aliases_workspace_id_fkey') THEN
    ALTER TABLE "product_mapping_aliases"
      ADD CONSTRAINT "product_mapping_aliases_workspace_id_fkey"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
