-- POS / orders hot-path indexes (workspace-scoped lists, POS catalog)
CREATE INDEX IF NOT EXISTS "orders_workspace_id_status_created_at_idx"
  ON "orders" ("workspace_id", "status", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "products_workspace_id_active_idx"
  ON "products" ("workspace_id", "active");

CREATE INDEX IF NOT EXISTS "products_workspace_id_active_pos_visible_idx"
  ON "products" ("workspace_id", "active", "pos_visible");

CREATE INDEX IF NOT EXISTS "pos_transactions_workspace_id_created_at_idx"
  ON "pos_transactions" ("workspace_id", "created_at" DESC);
