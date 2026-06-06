/**
 * Era 124 — Forecasting 2.0 wiring cert (Phase 7 #51).
 *
 * Full path: 90-day horizon → weather adjustments → holiday calendar.
 */

import {
  FORECASTING_2_PATH,
  FORECASTING_2_POLICY_ID,
  FORECASTING_2_SERVICE,
} from "@/lib/ai/forecasting-policy";

export const FORECASTING_2_ERA124_POLICY_ID = "era124-forecasting-2-v1" as const;

export const FORECASTING_2_ERA124_SUMMARY_ARTIFACT =
  "artifacts/forecasting-2-smoke-summary.json" as const;

export const FORECASTING_2_ERA124_NPM_SCRIPT = "smoke:forecasting-2-era124" as const;

export const FORECASTING_2_ERA124_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-forecasting-2-era124.ts" as const;

export const FORECASTING_2_ERA124_OPS_DOC = "docs/forecasting-2-era124-setup.md" as const;

export const FORECASTING_2_ERA124_WIRING_PATHS = [
  FORECASTING_2_SERVICE,
  "lib/ai/forecasting-builders.ts",
  "lib/ai/forecasting-policy.ts",
  "app/dashboard/forecast/forecasting-2/page.tsx",
  "components/ai/forecasting-2-panel.tsx",
] as const;

export const FORECASTING_2_ERA124_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Forecast → Forecasting 2.0.",
  "Review summary — 90-day orders, revenue, confidence, uplift days.",
  "Check upcoming holidays and weather adjustment copy.",
  "Inspect next 30 days table — orders, revenue, weather, events.",
  "Run npm run smoke:forecasting-2-era124 — artifact overall PASSED.",
] as const;

export const FORECASTING_2_ERA124_CI_SCRIPTS = [
  "test:ci:forecasting-2-era124",
  "test:ci:forecasting-2-era124:cert",
] as const;

export const FORECASTING_2_ERA124_UNIT_TESTS = [
  "tests/unit/forecasting-2-era124.test.ts",
  "tests/unit/forecasting-2.test.ts",
] as const;

export const FORECASTING_2_ERA124_CANONICAL_POLICY_ID = FORECASTING_2_POLICY_ID;

export const FORECASTING_2_ERA124_SERVICE = FORECASTING_2_SERVICE;

export const FORECASTING_2_ERA124_ROUTE = FORECASTING_2_PATH;

export const FORECASTING_2_ERA124_SIGNALS = [
  "90-day",
  "weather",
  "holidays",
] as const;
