-- Align `kitchen_settings` with Prisma `KitchenSettings.posSettingsJson` (@map("pos_settings_json")).
-- Idempotent: fixes DBs where `20260514180000_pos_terminal_module` was never applied or failed before this ALTER.
ALTER TABLE "kitchen_settings" ADD COLUMN IF NOT EXISTS "pos_settings_json" JSONB;
