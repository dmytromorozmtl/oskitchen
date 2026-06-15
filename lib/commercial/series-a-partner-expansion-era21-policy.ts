/**
 * Series A / partner expansion — Era 21 Step 7 product + CLI wiring.
 */

import { SERIES_A_PARTNER_EXPANSION_PHASES_ERA21_POLICY_ID } from "@/lib/commercial/series-a-partner-expansion-phases-era21";
/** Inline — avoids policy → ui → ops → policy TDZ at build time. */
const SERIES_A_PARTNER_EXPANSION_UI_ERA21_POLICY_ID = "era21-series-a-partner-expansion-ui-v1" as const;

export const SERIES_A_PARTNER_EXPANSION_ERA21_POLICY_ID =
  "era21-series-a-partner-expansion-v1" as const;

export const SERIES_A_PARTNER_EXPANSION_ERA21_BACKLOG_ID = "KOS-E21-007" as const;

export const SERIES_A_PARTNER_EXPANSION_ERA21_EXTENDS_POLICIES = [
  "era17-investor-narrative-onepager-v2-v1",
  "era17-competitor-feature-gap-matrix-v1",
  SERIES_A_PARTNER_EXPANSION_PHASES_ERA21_POLICY_ID,
  SERIES_A_PARTNER_EXPANSION_UI_ERA21_POLICY_ID,
  "era21-series-a-partner-expansion-post-scale-orchestrator-v1",
] as const;

export const SERIES_A_PARTNER_EXPANSION_ERA21_OPS_SCRIPTS = [
  "ops:run-production-ga-execution",
  "ops:run-series-a-partner-expansion-execution",
  "ops:run-series-a-partner-expansion-post-scale-orchestrator",
  "ops:validate-series-a-partner-expansion-env",
  "ops:validate-series-a-partner-expansion-integrity",
  "ops:sync-series-a-partner-expansion-integrity-baseline",
  "ops:export-series-a-partner-expansion-env-template",
  "ops:export-series-a-partner-expansion-readiness-checklist",
  "ops:sync-series-a-partner-expansion-progress-report",
] as const;

export const SERIES_A_PARTNER_EXPANSION_ERA21_CI_SCRIPTS = [
  "test:ci:production-ga-execution",
  "test:ci:production-ga-execution:cert",
  "test:ci:series-a-partner-expansion-execution",
  "test:ci:series-a-partner-expansion-execution:cert",
  "test:ci:series-a-partner-expansion-era21",
  "test:ci:series-a-partner-expansion-era21:cert",
  "test:ci:series-a-partner-expansion-integrity-era31",
] as const;

export const SERIES_A_PARTNER_EXPANSION_ERA21_UNIT_TESTS = [
  "tests/unit/production-ga-execution-orchestrator.test.ts",
  "tests/unit/production-ga-execution-cert-live.test.ts",
  "tests/unit/series-a-partner-expansion-execution-orchestrator.test.ts",
  "tests/unit/series-a-partner-expansion-execution-cert-live.test.ts",
  "tests/unit/series-a-partner-expansion-post-scale-orchestrator-era21.test.ts",
  "tests/unit/series-a-partner-expansion-phases-era21.test.ts",
  "tests/unit/series-a-partner-expansion-ui-era21.test.ts",
  "tests/unit/owner-daily-briefing-series-a-partner-expansion-era21.test.ts",
  "tests/unit/run-series-a-partner-expansion-post-scale-orchestrator.test.ts",
  "tests/unit/series-a-partner-expansion-era21-cert-live.test.ts",
  "tests/unit/series-a-partner-expansion-integrity-era31.test.ts",
  "tests/unit/validate-series-a-partner-expansion-integrity.test.ts",
  "tests/unit/series-a-partner-expansion-integrity-era31-cert-live.test.ts",
  "tests/unit/launch-wizard-series-a-era31.test.ts",
] as const;

export const SERIES_A_PARTNER_EXPANSION_ERA21_PRODUCT_SURFACES = [
  "components/dashboard/series-a-partner-expansion-phases-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-commercial-blockers-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-series-a-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-view.tsx",
  "components/dashboard/launch-wizard/launch-wizard-today-strip.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
