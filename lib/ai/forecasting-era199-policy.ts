/**
 * Era 199 — Forecasting 2.0 wiring cert (Phase 7 Round 2 #51).
 *
 * Full path: 90-day horizon → weather adjustments → holiday calendar.
 */

import {
  FORECASTING_2_ERA124_OPS_DOC,
  FORECASTING_2_ERA124_POLICY_ID,
  FORECASTING_2_ERA124_ROUTE,
  FORECASTING_2_ERA124_SERVICE,
  FORECASTING_2_ERA124_SIGNALS,
  FORECASTING_2_ERA124_SUMMARY_ARTIFACT,
  FORECASTING_2_ERA124_WIRING_PATHS,
} from "@/lib/ai/forecasting-era124-policy";

export const FORECASTING_2_ERA199_POLICY_ID = "era199-forecasting-2-v1" as const;

export const FORECASTING_2_ERA199_SUMMARY_ARTIFACT =
  "artifacts/forecasting-2-era199-smoke-summary.json" as const;

export const FORECASTING_2_ERA199_NPM_SCRIPT = "smoke:forecasting-2-era199" as const;

export const FORECASTING_2_ERA199_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-forecasting-2-era199.ts" as const;

export const FORECASTING_2_ERA199_OPS_DOC = "docs/forecasting-2-era199-setup.md" as const;

export const FORECASTING_2_ERA199_CANONICAL_OPS_DOC = FORECASTING_2_ERA124_OPS_DOC;

export const FORECASTING_2_ERA199_CANONICAL_SUMMARY_ARTIFACT =
  FORECASTING_2_ERA124_SUMMARY_ARTIFACT;

export const FORECASTING_2_ERA199_WIRING_PATHS = FORECASTING_2_ERA124_WIRING_PATHS;

export const FORECASTING_2_ERA199_SERVICE = FORECASTING_2_ERA124_SERVICE;

export const FORECASTING_2_ERA199_ROUTE = FORECASTING_2_ERA124_ROUTE;

export const FORECASTING_2_ERA199_SIGNALS = FORECASTING_2_ERA124_SIGNALS;

export const FORECASTING_2_ERA199_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Forecast → Forecasting 2.0.",
  "Review summary — 90-day orders, revenue, confidence, uplift days.",
  "Check upcoming holidays and weather adjustment copy.",
  "Inspect next 30 days table — orders, revenue, weather, events.",
  "Run npm run smoke:forecasting-2-era124 — canonical era124 wiring cert PASSED.",
  "Run npm run smoke:forecasting-2-era199 — artifact overall PASSED.",
] as const;

export const FORECASTING_2_ERA199_CI_SCRIPTS = [
  "test:ci:forecasting-2-era199",
  "test:ci:forecasting-2-era199:cert",
] as const;

export const FORECASTING_2_ERA199_UNIT_TESTS = [
  "tests/unit/forecasting-2-era199.test.ts",
  "tests/unit/forecasting-2-era124.test.ts",
  "tests/unit/forecasting-2.test.ts",
] as const;

export const FORECASTING_2_ERA199_CANONICAL_POLICY_ID = FORECASTING_2_ERA124_POLICY_ID;
