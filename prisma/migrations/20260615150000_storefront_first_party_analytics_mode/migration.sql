-- First-party storefront analytics mode (separate from marketing consent).

ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "first_party_analytics_mode" VARCHAR(32) NOT NULL DEFAULT 'ALWAYS_ON';
