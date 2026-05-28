/**
 * Market leader positioning — Era 21 Step 8 product + CLI wiring.
 */

import { MARKET_LEADER_POSITIONING_PHASES_ERA21_POLICY_ID } from "@/lib/commercial/market-leader-positioning-phases-era21";
import { MARKET_LEADER_POSITIONING_UI_ERA21_POLICY_ID } from "@/lib/commercial/market-leader-positioning-ui-era21";

export const MARKET_LEADER_POSITIONING_ERA21_POLICY_ID =
  "era21-market-leader-positioning-v1" as const;

export const MARKET_LEADER_POSITIONING_ERA21_BACKLOG_ID = "KOS-E21-008" as const;

export const MARKET_LEADER_POSITIONING_ERA21_EXTENDS_POLICIES = [
  "era21-series-a-partner-expansion-v1",
  MARKET_LEADER_POSITIONING_PHASES_ERA21_POLICY_ID,
  MARKET_LEADER_POSITIONING_UI_ERA21_POLICY_ID,
] as const;

export const MARKET_LEADER_POSITIONING_ERA21_OPS_SCRIPTS = [
  "ops:validate-market-leader-positioning-env",
  "ops:export-market-leader-positioning-env-template",
  "ops:sync-market-leader-positioning-progress-report",
] as const;

export const MARKET_LEADER_POSITIONING_ERA21_CI_SCRIPTS = [
  "test:ci:market-leader-positioning-era21",
  "test:ci:market-leader-positioning-era21:cert",
] as const;

export const MARKET_LEADER_POSITIONING_ERA21_UNIT_TESTS = [
  "tests/unit/market-leader-positioning-phases-era21.test.ts",
  "tests/unit/market-leader-positioning-ui-era21.test.ts",
  "tests/unit/owner-daily-briefing-market-leader-positioning-era21.test.ts",
  "tests/unit/market-leader-positioning-era21-cert-live.test.ts",
] as const;

export const MARKET_LEADER_POSITIONING_ERA21_PRODUCT_SURFACES = [
  "components/dashboard/market-leader-positioning-phases-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-commercial-blockers-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
