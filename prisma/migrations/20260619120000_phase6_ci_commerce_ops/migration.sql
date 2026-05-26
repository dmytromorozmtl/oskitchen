-- Phase 6: webhook signing secret
ALTER TABLE "storefront_settings"
  ADD COLUMN IF NOT EXISTS "page_publish_webhook_secret" TEXT;
