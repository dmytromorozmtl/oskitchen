-- Business profile / onboarding / demo workspace flags
CREATE TYPE "BusinessType" AS ENUM ('MEAL_PREP', 'CATERING', 'GHOST_KITCHEN', 'BAKERY', 'RESTAURANT', 'OTHER');

ALTER TABLE "users" ADD COLUMN "onboarding_completed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "onboarding_step" INTEGER NOT NULL DEFAULT 0;

UPDATE "users" SET "onboarding_completed" = true;

ALTER TABLE "kitchen_settings" ADD COLUMN "business_type" "BusinessType";
ALTER TABLE "kitchen_settings" ADD COLUMN "country" VARCHAR(120);
ALTER TABLE "kitchen_settings" ADD COLUMN "currency" VARCHAR(8) NOT NULL DEFAULT 'USD';
ALTER TABLE "kitchen_settings" ADD COLUMN "pickup_windows" TEXT;
ALTER TABLE "kitchen_settings" ADD COLUMN "demo_mode" BOOLEAN NOT NULL DEFAULT false;
