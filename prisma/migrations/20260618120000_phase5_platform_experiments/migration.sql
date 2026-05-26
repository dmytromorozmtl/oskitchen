ALTER TABLE "storefront_settings"
  ADD COLUMN IF NOT EXISTS "theme_experiment_json" JSONB;
