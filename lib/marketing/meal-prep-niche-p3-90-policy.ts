/**
 * P3-90 — Meal Prep OS niche positioning: native subscription + production + storefront.
 *
 * @see docs/meal-prep-niche-p3-90.md
 * @see app/meal-prep-software/page.tsx
 */

import { MEAL_PREP_SOFTWARE_LANDING_PATH } from "@/lib/marketing/meal-prep-software-landing-content";

export const MEAL_PREP_NICHE_P3_90_POLICY_ID = "meal-prep-niche-p3-90-v1" as const;

export const MEAL_PREP_NICHE_P3_90_DOC = "docs/meal-prep-niche-p3-90.md" as const;

export const MEAL_PREP_NICHE_P3_90_ARTIFACT = "artifacts/meal-prep-niche-p3-90.json" as const;

export const MEAL_PREP_NICHE_P3_90_CONTENT_MODULE =
  "lib/marketing/meal-prep-niche-p3-90-content.ts" as const;

export const MEAL_PREP_NICHE_P3_90_AUDIT_MODULE =
  "lib/marketing/meal-prep-niche-p3-90-audit.ts" as const;

export const MEAL_PREP_NICHE_P3_90_COMPONENT =
  "components/marketing/meal-prep-os-niche-section.tsx" as const;

export const MEAL_PREP_NICHE_P3_90_CHECK_NPM_SCRIPT = "check:meal-prep-niche-p3-90" as const;

export const MEAL_PREP_NICHE_P3_90_UNIT_TEST = "tests/unit/meal-prep-niche-p3-90.test.ts" as const;

export const MEAL_PREP_NICHE_P3_90_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const MEAL_PREP_NICHE_P3_90_CANONICAL_PATH = MEAL_PREP_SOFTWARE_LANDING_PATH;

export const MEAL_PREP_NICHE_P3_90_BRAND = "Meal Prep OS" as const;

export const MEAL_PREP_NICHE_P3_90_PILLAR_IDS = ["subscription", "production", "storefront"] as const;

export const MEAL_PREP_NICHE_P3_90_DASHBOARD_PATH = "/dashboard/meal-prep" as const;

export const MEAL_PREP_NICHE_P3_90_WIRING_PATHS = [
  MEAL_PREP_NICHE_P3_90_DOC,
  MEAL_PREP_NICHE_P3_90_ARTIFACT,
  MEAL_PREP_NICHE_P3_90_CONTENT_MODULE,
  MEAL_PREP_NICHE_P3_90_AUDIT_MODULE,
  MEAL_PREP_NICHE_P3_90_COMPONENT,
  MEAL_PREP_NICHE_P3_90_UNIT_TEST,
  MEAL_PREP_NICHE_P3_90_CI_WORKFLOW,
  "app/meal-prep-software/page.tsx",
  "components/marketing/meal-prep-software-landing.tsx",
  "lib/marketing/meal-prep-software-landing-content.ts",
] as const;
