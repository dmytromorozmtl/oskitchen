/**
 * Era 125 — Analytics Suite wiring cert (Phase 7 #52).
 *
 * Full path: revenue → orders → operations → forecast on one screen.
 */

import {
  ANALYTICS_SUITE_PATH,
  ANALYTICS_SUITE_POLICY_ID,
  ANALYTICS_SUITE_SERVICE,
} from "@/lib/analytics/analytics-suite-policy";

export const ANALYTICS_SUITE_ERA125_POLICY_ID = "era125-analytics-suite-v1" as const;

export const ANALYTICS_SUITE_ERA125_SUMMARY_ARTIFACT =
  "artifacts/analytics-suite-smoke-summary.json" as const;

export const ANALYTICS_SUITE_ERA125_NPM_SCRIPT = "smoke:analytics-suite-era125" as const;

export const ANALYTICS_SUITE_ERA125_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-analytics-suite-era125.ts" as const;

export const ANALYTICS_SUITE_ERA125_OPS_DOC = "docs/analytics-suite-era125-setup.md" as const;

export const ANALYTICS_SUITE_ERA125_WIRING_PATHS = [
  ANALYTICS_SUITE_SERVICE,
  "lib/analytics/analytics-suite-builders.ts",
  "lib/analytics/analytics-suite-policy.ts",
  "app/dashboard/analytics/suite/page.tsx",
  "components/analytics/analytics-suite-panel.tsx",
] as const;

export const ANALYTICS_SUITE_ERA125_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Analytics → Analytics Suite.",
  "Review summary — metric lanes, total metrics, warnings.",
  "Inspect all eight lanes — revenue, orders, customers, operations, catering, meal plans, inventory, forecast.",
  "Drill down via metric links to detailed analytics pages.",
  "Run npm run smoke:analytics-suite-era125 — artifact overall PASSED.",
] as const;

export const ANALYTICS_SUITE_ERA125_CI_SCRIPTS = [
  "test:ci:analytics-suite-era125",
  "test:ci:analytics-suite-era125:cert",
] as const;

export const ANALYTICS_SUITE_ERA125_UNIT_TESTS = [
  "tests/unit/analytics-suite-era125.test.ts",
  "tests/unit/analytics-suite.test.ts",
] as const;

export const ANALYTICS_SUITE_ERA125_CANONICAL_POLICY_ID = ANALYTICS_SUITE_POLICY_ID;

export const ANALYTICS_SUITE_ERA125_SERVICE = ANALYTICS_SUITE_SERVICE;

export const ANALYTICS_SUITE_ERA125_ROUTE = ANALYTICS_SUITE_PATH;

export const ANALYTICS_SUITE_ERA125_LANES = [
  "revenue",
  "orders",
  "customers",
  "operations",
  "catering",
  "meal_plans",
  "inventory",
  "forecast",
] as const;
