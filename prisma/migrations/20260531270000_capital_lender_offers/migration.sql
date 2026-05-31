-- Restaurant Capital Phase 3 — lender referrals + attestation share links

CREATE TYPE "CapitalPartnerReferralStatus" AS ENUM (
  'CONSENTED',
  'ATTESTATION_SHARED',
  'OFFER_VIEWED',
  'APPLIED',
  'FUNDED',
  'DECLINED',
  'WITHDRAWN'
);

CREATE TABLE "capital_partner_referrals" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "partner_slug" VARCHAR(80) NOT NULL,
    "attestation_id" UUID,
    "consent_at" TIMESTAMP(3) NOT NULL,
    "attestation_shared_at" TIMESTAMP(3),
    "offer_id" VARCHAR(128),
    "offer_title" VARCHAR(255),
    "offer_summary" VARCHAR(500),
    "offer_deep_link" TEXT,
    "status" "CapitalPartnerReferralStatus" NOT NULL DEFAULT 'CONSENTED',
    "status_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capital_partner_referrals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "capital_attestation_shares" (
    "id" UUID NOT NULL,
    "referral_id" UUID NOT NULL,
    "attestation_id" UUID NOT NULL,
    "share_token" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accessed_at" TIMESTAMP(3),
    "access_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "capital_attestation_shares_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "capital_attestation_shares_share_token_key" ON "capital_attestation_shares"("share_token");
CREATE INDEX "capital_partner_referrals_workspace_id_created_at_idx" ON "capital_partner_referrals"("workspace_id", "created_at");
CREATE INDEX "capital_partner_referrals_workspace_id_partner_slug_status_idx" ON "capital_partner_referrals"("workspace_id", "partner_slug", "status");
CREATE INDEX "capital_partner_referrals_partner_slug_status_updated_at_idx" ON "capital_partner_referrals"("partner_slug", "status_updated_at");
CREATE INDEX "capital_attestation_shares_referral_id_idx" ON "capital_attestation_shares"("referral_id");
CREATE INDEX "capital_attestation_shares_attestation_id_idx" ON "capital_attestation_shares"("attestation_id");
CREATE INDEX "capital_attestation_shares_expires_at_idx" ON "capital_attestation_shares"("expires_at");

ALTER TABLE "capital_partner_referrals" ADD CONSTRAINT "capital_partner_referrals_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "capital_partner_referrals" ADD CONSTRAINT "capital_partner_referrals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "capital_partner_referrals" ADD CONSTRAINT "capital_partner_referrals_attestation_id_fkey" FOREIGN KEY ("attestation_id") REFERENCES "revenue_attestations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "capital_attestation_shares" ADD CONSTRAINT "capital_attestation_shares_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "capital_partner_referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "capital_attestation_shares" ADD CONSTRAINT "capital_attestation_shares_attestation_id_fkey" FOREIGN KEY ("attestation_id") REFERENCES "revenue_attestations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
