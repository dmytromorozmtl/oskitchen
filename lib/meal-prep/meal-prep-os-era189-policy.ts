/**
 * Era 189 — Meal Prep OS wiring cert (Phase 5 Round 2 #41).
 *
 * Full path: weekly menu + cutoffs + forecasting + subscriptions → four modules → dashboard.
 */

import {
  MEAL_PREP_OS_ERA114_MODULES,
  MEAL_PREP_OS_ERA114_OPS_DOC,
  MEAL_PREP_OS_ERA114_POLICY_ID,
  MEAL_PREP_OS_ERA114_ROUTE,
  MEAL_PREP_OS_ERA114_SERVICE,
  MEAL_PREP_OS_ERA114_SUMMARY_ARTIFACT,
  MEAL_PREP_OS_ERA114_WIRING_PATHS,
} from "@/lib/meal-prep/meal-prep-os-era114-policy";

export const MEAL_PREP_OS_ERA189_POLICY_ID = "era189-meal-prep-os-v1" as const;

export const MEAL_PREP_OS_ERA189_SUMMARY_ARTIFACT =
  "artifacts/meal-prep-os-era189-smoke-summary.json" as const;

export const MEAL_PREP_OS_ERA189_NPM_SCRIPT = "smoke:meal-prep-os-era189" as const;

export const MEAL_PREP_OS_ERA189_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-meal-prep-os-era189.ts" as const;

export const MEAL_PREP_OS_ERA189_OPS_DOC = "docs/meal-prep-os-era189-setup.md" as const;

export const MEAL_PREP_OS_ERA189_CANONICAL_OPS_DOC = MEAL_PREP_OS_ERA114_OPS_DOC;

export const MEAL_PREP_OS_ERA189_CANONICAL_SUMMARY_ARTIFACT =
  MEAL_PREP_OS_ERA114_SUMMARY_ARTIFACT;

export const MEAL_PREP_OS_ERA189_WIRING_PATHS = MEAL_PREP_OS_ERA114_WIRING_PATHS;

export const MEAL_PREP_OS_ERA189_SERVICE = MEAL_PREP_OS_ERA114_SERVICE;

export const MEAL_PREP_OS_ERA189_ROUTE = MEAL_PREP_OS_ERA114_ROUTE;

export const MEAL_PREP_OS_ERA189_MODULES = MEAL_PREP_OS_ERA114_MODULES;

export const MEAL_PREP_OS_ERA189_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Meal Prep OS.",
  "Verify four module cards — Weekly Menu, Cutoffs, Forecasting, Subscriptions.",
  "Review active weekly menus and upcoming preorder deadlines.",
  "Check forecast committed meals and subscription cycle status.",
  "Run npm run smoke:meal-prep-os-era114 — canonical era114 wiring cert PASSED.",
  "Run npm run smoke:meal-prep-os-era189 — artifact overall PASSED.",
] as const;

export const MEAL_PREP_OS_ERA189_CI_SCRIPTS = [
  "test:ci:meal-prep-os-era189",
  "test:ci:meal-prep-os-era189:cert",
] as const;

export const MEAL_PREP_OS_ERA189_UNIT_TESTS = [
  "tests/unit/meal-prep-os-era189.test.ts",
  "tests/unit/meal-prep-os-era114.test.ts",
  "tests/unit/meal-prep-os.test.ts",
] as const;

export const MEAL_PREP_OS_ERA189_CANONICAL_POLICY_ID = MEAL_PREP_OS_ERA114_POLICY_ID;
