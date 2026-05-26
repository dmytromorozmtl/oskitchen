-- GA4 Data API numeric property ID (Admin → Property settings), separate from G- measurement ID.
ALTER TABLE "storefront_settings"
ADD COLUMN IF NOT EXISTS "google_analytics_property_id" VARCHAR(32);
