-- CreateEnum
CREATE TYPE "CapitalReferralBillingMeterKind" AS ENUM ('REFERRAL_FUNDED');

-- CreateEnum
CREATE TYPE "CapitalReferralBillingStatementStatus" AS ENUM ('DRAFT', 'FINALIZED', 'PAID');

-- CreateTable
CREATE TABLE "capital_partner_billing_accounts" (
    "partner_slug" VARCHAR(80) NOT NULL,
    "partner_name" VARCHAR(200) NOT NULL,
    "contact_email" VARCHAR(255),
    "referral_fee_bps" INTEGER NOT NULL DEFAULT 250,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "status" VARCHAR(32) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capital_partner_billing_accounts_pkey" PRIMARY KEY ("partner_slug")
);

-- CreateTable
CREATE TABLE "capital_referral_billing_meter_events" (
    "id" UUID NOT NULL,
    "partner_slug" VARCHAR(80) NOT NULL,
    "referral_id" UUID NOT NULL,
    "workspace_id" UUID,
    "kind" "CapitalReferralBillingMeterKind" NOT NULL,
    "funded_amount_cents" INTEGER NOT NULL DEFAULT 0,
    "referral_fee_cents" INTEGER NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "period_month" VARCHAR(7) NOT NULL,
    "idempotency_key" VARCHAR(128) NOT NULL,
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "capital_referral_billing_meter_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capital_referral_billing_statements" (
    "id" UUID NOT NULL,
    "partner_slug" VARCHAR(80) NOT NULL,
    "period_month" VARCHAR(7) NOT NULL,
    "status" "CapitalReferralBillingStatementStatus" NOT NULL DEFAULT 'DRAFT',
    "total_accrued_cents" INTEGER NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "finalized_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capital_referral_billing_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capital_lender_webhook_deliveries" (
    "id" UUID NOT NULL,
    "partner_slug" VARCHAR(80) NOT NULL,
    "idempotency_key" VARCHAR(128) NOT NULL,
    "referral_id" UUID NOT NULL,
    "payload_hash" VARCHAR(64),
    "response_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "capital_lender_webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "capital_referral_billing_meter_events_idempotency_key_key" ON "capital_referral_billing_meter_events"("idempotency_key");

-- CreateIndex
CREATE INDEX "capital_referral_billing_meter_events_partner_slug_period_m_idx" ON "capital_referral_billing_meter_events"("partner_slug", "period_month");

-- CreateIndex
CREATE INDEX "capital_referral_billing_meter_events_referral_id_idx" ON "capital_referral_billing_meter_events"("referral_id");

-- CreateIndex
CREATE UNIQUE INDEX "capital_referral_billing_statements_partner_slug_period_mont_key" ON "capital_referral_billing_statements"("partner_slug", "period_month");

-- CreateIndex
CREATE UNIQUE INDEX "capital_lender_webhook_deliveries_partner_slug_idempotency__key" ON "capital_lender_webhook_deliveries"("partner_slug", "idempotency_key");

-- CreateIndex
CREATE INDEX "capital_lender_webhook_deliveries_referral_id_created_at_idx" ON "capital_lender_webhook_deliveries"("referral_id", "created_at");

-- AddForeignKey
ALTER TABLE "capital_referral_billing_meter_events" ADD CONSTRAINT "capital_referral_billing_meter_events_partner_slug_fkey" FOREIGN KEY ("partner_slug") REFERENCES "capital_partner_billing_accounts"("partner_slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capital_referral_billing_statements" ADD CONSTRAINT "capital_referral_billing_statements_partner_slug_fkey" FOREIGN KEY ("partner_slug") REFERENCES "capital_partner_billing_accounts"("partner_slug") ON DELETE CASCADE ON UPDATE CASCADE;
