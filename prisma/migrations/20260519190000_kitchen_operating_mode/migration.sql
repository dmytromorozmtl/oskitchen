-- CreateEnum
CREATE TYPE "KitchenOperatingMode" AS ENUM ('WEEKLY_PREORDER', 'DAILY_SERVICE');

-- AlterTable
ALTER TABLE "kitchen_settings" ADD COLUMN "operating_mode" "KitchenOperatingMode" NOT NULL DEFAULT 'WEEKLY_PREORDER';
