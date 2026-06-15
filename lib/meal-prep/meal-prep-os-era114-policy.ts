/**
 * Era 114 — Meal Prep OS wiring cert (Phase 5 extension #114).
 *
 * Full path: weekly menu + cutoffs + forecasting + subscriptions → four modules → dashboard.
 */

import { MEAL_PREP_OS_POLICY_ID } from "@/lib/meal-prep/meal-prep-os-policy";

export const MEAL_PREP_OS_ERA114_POLICY_ID = "era114-meal-prep-os-v1" as const;

export const MEAL_PREP_OS_ERA114_SUMMARY_ARTIFACT =
  "artifacts/meal-prep-os-smoke-summary.json" as const;

export const MEAL_PREP_OS_ERA114_NPM_SCRIPT = "smoke:meal-prep-os-era114" as const;

export const MEAL_PREP_OS_ERA114_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-meal-prep-os-era114.ts" as const;

export const MEAL_PREP_OS_ERA114_OPS_DOC = "docs/meal-prep-os-era114-setup.md" as const;

export const MEAL_PREP_OS_ERA114_WIRING_PATHS = [
  "services/meal-prep/meal-prep-os-service.ts",
  "lib/meal-prep/meal-prep-os-builders.ts",
  "lib/meal-prep/meal-prep-os-policy.ts",
  "app/dashboard/meal-prep/page.tsx",
  "components/meal-prep/meal-prep-os-panel.tsx",
] as const;

export const MEAL_PREP_OS_ERA114_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Meal Prep OS.",
  "Verify four module cards — Weekly Menu, Cutoffs, Forecasting, Subscriptions.",
  "Review active weekly menus and upcoming preorder deadlines.",
  "Check forecast committed meals and subscription cycle status.",
  "Run npm run smoke:meal-prep-os-era114 — artifact overall PASSED.",
] as const;

export const MEAL_PREP_OS_ERA114_CI_SCRIPTS = [
  "test:ci:meal-prep-os-era114",
  "test:ci:meal-prep-os-era114:cert",
] as const;

export const MEAL_PREP_OS_ERA114_UNIT_TESTS = [
  "tests/unit/meal-prep-os-era114.test.ts",
  "tests/unit/meal-prep-os.test.ts",
] as const;

export const MEAL_PREP_OS_ERA114_CANONICAL_POLICY_ID = MEAL_PREP_OS_POLICY_ID;

export const MEAL_PREP_OS_ERA114_SERVICE = "services/meal-prep/meal-prep-os-service.ts" as const;

export const MEAL_PREP_OS_ERA114_ROUTE = "/dashboard/meal-prep" as const;

export const MEAL_PREP_OS_ERA114_MODULES = [
  "weekly_menu",
  "cutoffs",
  "forecasting",
  "subscriptions",
] as const;
