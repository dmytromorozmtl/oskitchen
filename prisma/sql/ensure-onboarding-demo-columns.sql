-- Idempotent DDL for environments where Prisma migrations were skipped (e.g. only `db push`).
-- Requires PostgreSQL 11+ (ADD COLUMN IF NOT EXISTS).
-- Prefer: npm run db:deploy
--
-- If you run this file manually instead of migrations, mark the migration applied so
-- `prisma migrate deploy` does not try to duplicate objects:
--   npx prisma migrate resolve --applied 20260508140000_sellable_onboarding_demo

DO $$
BEGIN
  CREATE TYPE "BusinessType" AS ENUM (
    'MEAL_PREP',
    'CATERING',
    'GHOST_KITCHEN',
    'BAKERY',
    'RESTAURANT',
    'OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_completed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_step" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "kitchen_settings" ADD COLUMN IF NOT EXISTS "business_type" "BusinessType";
ALTER TABLE "kitchen_settings" ADD COLUMN IF NOT EXISTS "country" VARCHAR(120);
ALTER TABLE "kitchen_settings" ADD COLUMN IF NOT EXISTS "currency" VARCHAR(8) NOT NULL DEFAULT 'USD';
ALTER TABLE "kitchen_settings" ADD COLUMN IF NOT EXISTS "pickup_windows" TEXT;
ALTER TABLE "kitchen_settings" ADD COLUMN IF NOT EXISTS "demo_mode" BOOLEAN NOT NULL DEFAULT false;
