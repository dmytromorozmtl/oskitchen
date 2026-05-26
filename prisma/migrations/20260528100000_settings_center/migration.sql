-- Settings Center: additive JSON column on kitchen_settings.
-- Stores the structured payload defined in lib/settings/settings-defaults.ts.
-- Always merged with defaults at read-time; missing keys never break the UI.

ALTER TABLE "kitchen_settings"
  ADD COLUMN IF NOT EXISTS "settings_center_json" JSONB;
