/**
 * Market leader positioning convergence integrity — policy wiring.
 */

import {
  MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_POLICY_ID,
  MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/market-leader-positioning-convergence-integrity-era52";

export {
  MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_POLICY_ID,
  MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
};

export const MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_OPS_SCRIPTS = [
  "ops:validate-market-leader-positioning-convergence-integrity",
  "ops:sync-market-leader-positioning-convergence-integrity-baseline",
] as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_CI_SCRIPTS = [
  "test:ci:market-leader-positioning-convergence-integrity-era52",
] as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_UNIT_TESTS = [
  "tests/unit/market-leader-positioning-convergence-integrity-era52.test.ts",
  "tests/unit/validate-market-leader-positioning-convergence-integrity.test.ts",
  "tests/unit/market-leader-positioning-convergence-integrity-era52-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-market-leader-positioning-convergence-era52.test.ts",
  "tests/unit/owner-daily-briefing-era25-market-leader-positioning-convergence-era52.test.ts",
] as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-market-leader-positioning-convergence-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
