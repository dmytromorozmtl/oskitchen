/**
 * Era 138 — Corporate Reporting wiring cert (Phase 9 #65).
 *
 * Full path: CEO P&L → revenue trends → 90-day forecast.
 */

import {
  CORPORATE_REPORTING_PATH,
  CORPORATE_REPORTING_POLICY_ID,
} from "@/lib/enterprise/corporate-reporting-policy";

export const CORPORATE_REPORTING_ERA138_POLICY_ID = "era138-corporate-reporting-v1" as const;

export const CORPORATE_REPORTING_ERA138_SUMMARY_ARTIFACT =
  "artifacts/corporate-reporting-smoke-summary.json" as const;

export const CORPORATE_REPORTING_ERA138_NPM_SCRIPT = "smoke:corporate-reporting-era138" as const;

export const CORPORATE_REPORTING_ERA138_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-corporate-reporting-era138.ts" as const;

export const CORPORATE_REPORTING_ERA138_OPS_DOC = "docs/corporate-reporting-era138-setup.md" as const;

export const CORPORATE_REPORTING_ERA138_SERVICE =
  "services/enterprise/corporate-reporting-service.ts" as const;

export const CORPORATE_REPORTING_ERA138_WIRING_PATHS = [
  CORPORATE_REPORTING_ERA138_SERVICE,
  "lib/enterprise/corporate-reporting-builders.ts",
  "lib/enterprise/corporate-reporting-policy.ts",
  "app/dashboard/enterprise/reports/page.tsx",
  "components/enterprise/corporate-reporting-panel.tsx",
] as const;

export const CORPORATE_REPORTING_ERA138_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Enterprise → Corporate Reporting.",
  "Review KPI cards — net revenue, gross profit, EBITDA proxy, 90-day forecast.",
  "Inspect P&L statement — revenue through EBITDA proxy with % of net.",
  "Check Revenue trend chart and Forecast outlook strip.",
  "Run npm run smoke:corporate-reporting-era138 — artifact overall PASSED.",
] as const;

export const CORPORATE_REPORTING_ERA138_CI_SCRIPTS = [
  "test:ci:corporate-reporting-era138",
  "test:ci:corporate-reporting-era138:cert",
] as const;

export const CORPORATE_REPORTING_ERA138_UNIT_TESTS = [
  "tests/unit/corporate-reporting-era138.test.ts",
  "tests/unit/corporate-reporting.test.ts",
] as const;

export const CORPORATE_REPORTING_ERA138_CANONICAL_POLICY_ID = CORPORATE_REPORTING_POLICY_ID;

export const CORPORATE_REPORTING_ERA138_ROUTE = CORPORATE_REPORTING_PATH;

export const CORPORATE_REPORTING_ERA138_SECTIONS = [
  "pl",
  "trends",
  "forecast",
] as const;
