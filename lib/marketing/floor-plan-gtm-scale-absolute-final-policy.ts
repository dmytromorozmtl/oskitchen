/**
 * Absolute Final Task 137 — visual floor plan editor GTM scale (feature 92).
 *
 * @see docs/floor-plan-gtm-scale.md
 * @see components/restaurant/floor-plan-editor.tsx
 */

export const FLOOR_PLAN_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "floor-plan-gtm-scale-absolute-final-v1" as const;

export const FLOOR_PLAN_GTM_SCALE_DOC_PATH = "docs/floor-plan-gtm-scale.md" as const;

export const FLOOR_PLAN_GTM_SCALE_HONESTY_MARKERS = [
  "Oracle MICROS parity",
  "BETA",
  "not certified live occupancy",
  "Supabase Realtime",
  "sales-safe",
] as const;

export const FLOOR_PLAN_GTM_SCALE_WIRING_PATHS = [
  FLOOR_PLAN_GTM_SCALE_DOC_PATH,
  "components/restaurant/floor-plan-editor.tsx",
  "lib/restaurant/visual-floor-plan-editor-absolute-final-policy.ts",
  "lib/marketing/floor-plan-gtm-scale-absolute-final-policy.ts",
  "lib/marketing/floor-plan-gtm-scale-audit.ts",
  "tests/unit/visual-floor-plan-editor-absolute-final.test.ts",
] as const;
