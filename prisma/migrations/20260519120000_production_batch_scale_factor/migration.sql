-- AlterTable
ALTER TABLE "production_batches" ADD COLUMN IF NOT EXISTS "scale_factor" DECIMAL(8,2) NOT NULL DEFAULT 1;
