ALTER TABLE "storefront_settings"
ADD COLUMN IF NOT EXISTS "experiment_legal_hold_at" TIMESTAMPTZ;
