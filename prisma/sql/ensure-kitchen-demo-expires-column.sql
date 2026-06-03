ALTER TABLE "kitchen_settings"
ADD COLUMN IF NOT EXISTS "demo_expires_at" TIMESTAMPTZ;
