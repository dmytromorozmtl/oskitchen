-- Phase 7 — backwards-compatible alias (core only).
-- For full stack use: npm run db:apply-storefront-phases

ALTER TABLE storefront_settings ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT true;

UPDATE storefront_settings SET is_primary = true WHERE is_primary IS NOT TRUE;

DROP INDEX IF EXISTS storefront_settings_user_id_key;

CREATE INDEX IF NOT EXISTS storefront_settings_user_id_idx ON storefront_settings(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS storefront_settings_user_slug_key
  ON storefront_settings(user_id, store_slug);

DROP INDEX IF EXISTS storefront_settings_one_primary_per_user;
CREATE UNIQUE INDEX storefront_settings_one_primary_per_user
  ON storefront_settings(user_id) WHERE is_primary = true;
