-- App Marketplace Phase 5 — partner billing meters + statements

CREATE TYPE "PartnerBillingMeterKind" AS ENUM (
  'INSTALL_NEW',
  'INSTALL_ACTIVE',
  'INSTALL_REVOKED',
  'API_REQUEST',
  'WEBHOOK_DELIVERY'
);

CREATE TYPE "PartnerBillingStatementStatus" AS ENUM (
  'DRAFT',
  'FINALIZED',
  'PAID',
  'VOID'
);

CREATE TABLE "partner_billing_accounts" (
    "id" UUID NOT NULL,
    "publisher_key" VARCHAR(120) NOT NULL,
    "publisher_name" VARCHAR(255) NOT NULL,
    "contact_email" VARCHAR(255),
    "revenue_share_bps" INTEGER NOT NULL DEFAULT 1500,
    "monthly_platform_fee_cents_per_install" INTEGER NOT NULL DEFAULT 500,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "status" VARCHAR(32) NOT NULL DEFAULT 'active',
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_billing_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "partner_billing_meter_events" (
    "id" UUID NOT NULL,
    "publisher_key" VARCHAR(120) NOT NULL,
    "client_id" VARCHAR(128),
    "workspace_id" UUID,
    "installation_id" UUID,
    "kind" "PartnerBillingMeterKind" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_amount_cents" INTEGER NOT NULL DEFAULT 0,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "period_month" VARCHAR(7) NOT NULL,
    "idempotency_key" VARCHAR(200) NOT NULL,
    "metadata_json" JSONB,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_billing_meter_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "partner_billing_statements" (
    "id" UUID NOT NULL,
    "publisher_key" VARCHAR(120) NOT NULL,
    "period_month" VARCHAR(7) NOT NULL,
    "status" "PartnerBillingStatementStatus" NOT NULL DEFAULT 'DRAFT',
    "total_accrued_cents" INTEGER NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "line_items_json" JSONB NOT NULL,
    "finalized_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_billing_statements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "partner_billing_accounts_publisher_key_key" ON "partner_billing_accounts"("publisher_key");
CREATE INDEX "partner_billing_accounts_status_idx" ON "partner_billing_accounts"("status");

CREATE UNIQUE INDEX "partner_billing_meter_events_idempotency_key_key" ON "partner_billing_meter_events"("idempotency_key");
CREATE INDEX "partner_billing_meter_events_publisher_key_period_month_idx" ON "partner_billing_meter_events"("publisher_key", "period_month");
CREATE INDEX "partner_billing_meter_events_client_id_period_month_idx" ON "partner_billing_meter_events"("client_id", "period_month");
CREATE INDEX "partner_billing_meter_events_installation_id_idx" ON "partner_billing_meter_events"("installation_id");

CREATE UNIQUE INDEX "partner_billing_statements_publisher_key_period_month_key" ON "partner_billing_statements"("publisher_key", "period_month");
CREATE INDEX "partner_billing_statements_status_period_month_idx" ON "partner_billing_statements"("status", "period_month");

ALTER TABLE "partner_billing_meter_events" ADD CONSTRAINT "partner_billing_meter_events_publisher_key_fkey" FOREIGN KEY ("publisher_key") REFERENCES "partner_billing_accounts"("publisher_key") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "partner_billing_statements" ADD CONSTRAINT "partner_billing_statements_publisher_key_fkey" FOREIGN KEY ("publisher_key") REFERENCES "partner_billing_accounts"("publisher_key") ON DELETE CASCADE ON UPDATE CASCADE;
