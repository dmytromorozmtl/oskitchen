/**
 * Era 200 — Analytics Suite wiring cert (Phase 7 Round 2 #52).
 *
 * Full path: revenue → orders → operations → forecast on one screen.
 */

import {
  ANALYTICS_SUITE_ERA125_LANES,
  ANALYTICS_SUITE_ERA125_OPS_DOC,
  ANALYTICS_SUITE_ERA125_POLICY_ID,
  ANALYTICS_SUITE_ERA125_ROUTE,
  ANALYTICS_SUITE_ERA125_SERVICE,
  ANALYTICS_SUITE_ERA125_SUMMARY_ARTIFACT,
  ANALYTICS_SUITE_ERA125_WIRING_PATHS,
} from "@/lib/analytics/analytics-suite-era125-policy";

export const ANALYTICS_SUITE_ERA200_POLICY_ID = "era200-analytics-suite-v1" as const;

export const ANALYTICS_SUITE_ERA200_SUMMARY_ARTIFACT =
  "artifacts/analytics-suite-era200-smoke-summary.json" as const;

export const ANALYTICS_SUITE_ERA200_NPM_SCRIPT = "smoke:analytics-suite-era200" as const;

export const ANALYTICS_SUITE_ERA200_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-analytics-suite-era200.ts" as const;

export const ANALYTICS_SUITE_ERA200_OPS_DOC = "docs/analytics-suite-era200-setup.md" as const;

export const ANALYTICS_SUITE_ERA200_CANONICAL_OPS_DOC = ANALYTICS_SUITE_ERA125_OPS_DOC;

export const ANALYTICS_SUITE_ERA200_CANONICAL_SUMMARY_ARTIFACT =
  ANALYTICS_SUITE_ERA125_SUMMARY_ARTIFACT;

export const ANALYTICS_SUITE_ERA200_WIRING_PATHS = ANALYTICS_SUITE_ERA125_WIRING_PATHS;

export const ANALYTICS_SUITE_ERA200_SERVICE = ANALYTICS_SUITE_ERA125_SERVICE;

export const ANALYTICS_SUITE_ERA200_ROUTE = ANALYTICS_SUITE_ERA125_ROUTE;

export const ANALYTICS_SUITE_ERA200_LANES = ANALYTICS_SUITE_ERA125_LANES;

export const ANALYTICS_SUITE_ERA200_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Analytics → Analytics Suite.",
  "Review summary — metric lanes, total metrics, warnings.",
  "Inspect all eight lanes — revenue, orders, customers, operations, catering, meal plans, inventory, forecast.",
  "Drill down via metric links to detailed analytics pages.",
  "Run npm run smoke:analytics-suite-era125 — canonical era125 wiring cert PASSED.",
  "Run npm run smoke:analytics-suite-era200 — artifact overall PASSED.",
] as const;

export const ANALYTICS_SUITE_ERA200_CI_SCRIPTS = [
  "test:ci:analytics-suite-era200",
  "test:ci:analytics-suite-era200:cert",
] as const;

export const ANALYTICS_SUITE_ERA200_UNIT_TESTS = [
  "tests/unit/analytics-suite-era200.test.ts",
  "tests/unit/analytics-suite-era125.test.ts",
  "tests/unit/analytics-suite.test.ts",
] as const;

export const ANALYTICS_SUITE_ERA200_CANONICAL_POLICY_ID = ANALYTICS_SUITE_ERA125_POLICY_ID;
