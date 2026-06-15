-- Phase 5B–5F: cart recovery v2, staff publish, scheduled theme, page webhook
ALTER TABLE "storefront_settings"
  ADD COLUMN IF NOT EXISTS "staff_can_publish_storefront" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "theme_publish_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "page_publish_webhook_url" TEXT;

ALTER TABLE "storefront_cart_recoveries"
  ADD COLUMN IF NOT EXISTS "marketing_consent_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "unsubscribed_at" TIMESTAMPTZ;
