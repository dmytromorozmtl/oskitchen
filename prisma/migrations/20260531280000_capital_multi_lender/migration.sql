-- Restaurant Capital Phase 4 — multi-lender offer snapshots + referral selection

ALTER TABLE "capital_partner_referrals"
  ADD COLUMN "compared_at" TIMESTAMP(3),
  ADD COLUMN "selected_offer_id" UUID;

CREATE TABLE "capital_partner_offers" (
    "id" UUID NOT NULL,
    "referral_id" UUID NOT NULL,
    "partner_offer_id" VARCHAR(128) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "summary" VARCHAR(500),
    "amount_min" DECIMAL(14,2),
    "amount_max" DECIMAL(14,2),
    "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "term_label" VARCHAR(120),
    "rate_label" VARCHAR(120),
    "deep_link" TEXT,
    "expires_at" TIMESTAMP(3),
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capital_partner_offers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "capital_partner_offers_referral_id_partner_offer_id_key"
  ON "capital_partner_offers"("referral_id", "partner_offer_id");
CREATE INDEX "capital_partner_offers_referral_id_expires_at_idx"
  ON "capital_partner_offers"("referral_id", "expires_at");

ALTER TABLE "capital_partner_referrals"
  ADD CONSTRAINT "capital_partner_referrals_selected_offer_id_fkey"
  FOREIGN KEY ("selected_offer_id") REFERENCES "capital_partner_offers"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "capital_partner_offers"
  ADD CONSTRAINT "capital_partner_offers_referral_id_fkey"
  FOREIGN KEY ("referral_id") REFERENCES "capital_partner_referrals"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
