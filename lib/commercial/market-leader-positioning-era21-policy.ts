/**
 * Market leader positioning — Era 21 Step 8 product + CLI wiring.
 */

import { MARKET_LEADER_POSITIONING_PHASES_ERA21_POLICY_ID } from "@/lib/commercial/market-leader-positioning-phases-era21";
/** Inline — avoids policy → ui → ops → policy TDZ at build time. */
const MARKET_LEADER_POSITIONING_UI_ERA21_POLICY_ID = "era21-market-leader-positioning-ui-v1" as const;

export const MARKET_LEADER_POSITIONING_ERA21_POLICY_ID =
  "era21-market-leader-positioning-v1" as const;

export const MARKET_LEADER_POSITIONING_ERA21_BACKLOG_ID = "KOS-E21-008" as const;

export const MARKET_LEADER_POSITIONING_ERA21_EXTENDS_POLICIES = [
  "era21-series-a-partner-expansion-v1",
  MARKET_LEADER_POSITIONING_PHASES_ERA21_POLICY_ID,
  MARKET_LEADER_POSITIONING_UI_ERA21_POLICY_ID,
  "era21-market-leader-positioning-post-series-a-orchestrator-v1",
] as const;

export const MARKET_LEADER_POSITIONING_ERA21_OPS_SCRIPTS = [
  "ops:run-market-leader-positioning-execution",
  "ops:run-series-a-partner-expansion-execution",
  "ops:run-market-leader-positioning-post-series-a-orchestrator",
  "ops:validate-market-leader-positioning-env",
  "ops:validate-market-leader-positioning-integrity",
  "ops:sync-market-leader-positioning-integrity-baseline",
  "ops:export-market-leader-positioning-env-template",
  "ops:export-market-leader-positioning-readiness-checklist",
  "ops:sync-market-leader-positioning-progress-report",
] as const;

export const MARKET_LEADER_POSITIONING_ERA21_CI_SCRIPTS = [
  "test:ci:market-leader-positioning-execution",
  "test:ci:market-leader-positioning-execution:cert",
  "test:ci:market-leader-positioning-era21",
  "test:ci:market-leader-positioning-era21:cert",
  "test:ci:market-leader-positioning-integrity-era32",
] as const;

export const MARKET_LEADER_POSITIONING_ERA21_UNIT_TESTS = [
  "tests/unit/market-leader-positioning-execution-orchestrator.test.ts",
  "tests/unit/market-leader-positioning-execution-cert-live.test.ts",
  "tests/unit/market-leader-positioning-post-series-a-orchestrator-era21.test.ts",
  "tests/unit/market-leader-positioning-phases-era21.test.ts",
  "tests/unit/market-leader-positioning-ui-era21.test.ts",
  "tests/unit/owner-daily-briefing-market-leader-positioning-era21.test.ts",
  "tests/unit/run-market-leader-positioning-post-series-a-orchestrator.test.ts",
  "tests/unit/market-leader-positioning-era21-cert-live.test.ts",
  "tests/unit/market-leader-positioning-integrity-era32.test.ts",
  "tests/unit/validate-market-leader-positioning-integrity.test.ts",
  "tests/unit/market-leader-positioning-integrity-era32-cert-live.test.ts",
  "tests/unit/launch-wizard-market-leader-era32.test.ts",
] as const;

export const MARKET_LEADER_POSITIONING_ERA21_PRODUCT_SURFACES = [
  "components/dashboard/market-leader-positioning-phases-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-commercial-blockers-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-market-leader-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-view.tsx",
  "components/dashboard/launch-wizard/launch-wizard-today-strip.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
