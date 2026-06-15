/**
 * Market leader positioning integrity — policy wiring.
 */

import {
  MARKET_LEADER_POSITIONING_INTEGRITY_ERA32_POLICY_ID,
  MARKET_LEADER_POSITIONING_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/market-leader-positioning-integrity-era32";

export {
  MARKET_LEADER_POSITIONING_INTEGRITY_ERA32_POLICY_ID,
  MARKET_LEADER_POSITIONING_INTEGRITY_BASELINE_ARTIFACT,
};

export const MARKET_LEADER_POSITIONING_INTEGRITY_ERA32_OPS_SCRIPTS = [
  "ops:validate-market-leader-positioning-integrity",
  "ops:sync-market-leader-positioning-integrity-baseline",
] as const;

export const MARKET_LEADER_POSITIONING_INTEGRITY_ERA32_CI_SCRIPTS = [
  "test:ci:market-leader-positioning-integrity-era32",
] as const;

export const MARKET_LEADER_POSITIONING_INTEGRITY_ERA32_UNIT_TESTS = [
  "tests/unit/market-leader-positioning-integrity-era32.test.ts",
  "tests/unit/validate-market-leader-positioning-integrity.test.ts",
  "tests/unit/market-leader-positioning-integrity-era32-cert-live.test.ts",
] as const;
