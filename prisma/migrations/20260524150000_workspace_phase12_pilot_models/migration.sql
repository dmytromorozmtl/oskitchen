-- Phase 12: workspace_id on pilot IDOR-risk models (nullable; backfill via scripts/backfill-workspace-phase12.ts)

ALTER TABLE "billing_customers" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "billing_customers_workspace_id_idx" ON "billing_customers"("workspace_id");

ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "api_keys_workspace_id_idx" ON "api_keys"("workspace_id");

ALTER TABLE "channel_credential_audits" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "channel_credential_audits_workspace_id_idx" ON "channel_credential_audits"("workspace_id");

ALTER TABLE "bank_transactions" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "bank_transactions_workspace_id_idx" ON "bank_transactions"("workspace_id");

ALTER TABLE "cash_counts" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "cash_counts_workspace_id_idx" ON "cash_counts"("workspace_id");

ALTER TABLE "commissary_transfers" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "commissary_transfers_workspace_id_idx" ON "commissary_transfers"("workspace_id");

ALTER TABLE "company_accounts" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "company_accounts_workspace_id_idx" ON "company_accounts"("workspace_id");

ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "catering_quotes_workspace_id_idx" ON "catering_quotes"("workspace_id");
CREATE INDEX IF NOT EXISTS "catering_quotes_workspace_id_status_idx" ON "catering_quotes"("workspace_id", "status");

ALTER TABLE "automation_rules" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "automation_rules_workspace_id_idx" ON "automation_rules"("workspace_id");

ALTER TABLE "analytics_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "analytics_events_workspace_id_created_at_idx" ON "analytics_events"("workspace_id", "created_at");
