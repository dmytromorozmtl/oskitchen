-- Expand BusinessType for FoodOps operating modes (additive; existing values unchanged).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'BusinessType' AND e.enumlabel = 'CAFE'
  ) THEN
    ALTER TYPE "BusinessType" ADD VALUE 'CAFE';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'BusinessType' AND e.enumlabel = 'BAR'
  ) THEN
    ALTER TYPE "BusinessType" ADD VALUE 'BAR';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'BusinessType' AND e.enumlabel = 'CLOUD_KITCHEN'
  ) THEN
    ALTER TYPE "BusinessType" ADD VALUE 'CLOUD_KITCHEN';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'BusinessType' AND e.enumlabel = 'MULTI_BRAND'
  ) THEN
    ALTER TYPE "BusinessType" ADD VALUE 'MULTI_BRAND';
  END IF;
END$$;
