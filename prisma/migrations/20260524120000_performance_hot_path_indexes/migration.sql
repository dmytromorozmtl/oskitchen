-- Hot-path composite indexes (idempotent)
CREATE INDEX IF NOT EXISTS "products_workspace_id_category_active_idx" ON "products"("workspace_id", "category", "active");
CREATE INDEX IF NOT EXISTS "storefront_orders_user_id_status_created_at_idx" ON "storefront_orders"("user_id", "status", "created_at");
CREATE INDEX IF NOT EXISTS "pos_transactions_shift_id_created_at_idx" ON "pos_transactions"("shift_id", "created_at");
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_action_created_at_idx" ON "audit_logs"("user_id", "action", "created_at");
