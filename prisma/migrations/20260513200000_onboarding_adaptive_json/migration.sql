-- Adaptive onboarding progress + selections (per owner kitchen settings).
ALTER TABLE "kitchen_settings" ADD COLUMN IF NOT EXISTS "onboarding_adaptive_json" JSONB;
