-- Workspace Phase 1: optional workspace_id on orders, menus, products
-- Apply with: npx prisma migrate deploy (staging/prod) or npx prisma migrate dev (local)

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "menus" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "orders_workspace_id_created_at_idx" ON "orders"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "orders_workspace_id_status_idx" ON "orders"("workspace_id", "status");
CREATE INDEX IF NOT EXISTS "menus_workspace_id_created_at_idx" ON "menus"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "products_workspace_id_created_at_idx" ON "products"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "webhook_events_user_id_received_at_idx" ON "webhook_events"("user_id", "received_at");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_workspace_id_fkey'
  ) THEN
    ALTER TABLE "orders"
      ADD CONSTRAINT "orders_workspace_id_fkey"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'menus_workspace_id_fkey'
  ) THEN
    ALTER TABLE "menus"
      ADD CONSTRAINT "menus_workspace_id_fkey"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_workspace_id_fkey'
  ) THEN
    ALTER TABLE "products"
      ADD CONSTRAINT "products_workspace_id_fkey"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
