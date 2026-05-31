-- CreateEnum
CREATE TYPE "PartnerBillingPayoutStatus" AS ENUM ('NONE', 'PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "partner_billing_accounts" ADD COLUMN "stripe_connect_account_id" VARCHAR(64),
ADD COLUMN "stripe_connect_payouts_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "stripe_connect_details_submitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "stripe_connect_onboarded_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "partner_billing_statements" ADD COLUMN "stripe_transfer_id" VARCHAR(64),
ADD COLUMN "payout_status" "PartnerBillingPayoutStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN "payout_error" TEXT,
ADD COLUMN "payout_initiated_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "partner_billing_statements_payout_status_idx" ON "partner_billing_statements"("payout_status");
