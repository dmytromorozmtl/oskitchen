/**
 * Month 2 market readiness convergence integrity — policy wiring.
 */

import {
  MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_ERA49_POLICY_ID,
  MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/month2-market-readiness-convergence-integrity-era49";

export {
  MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_ERA49_POLICY_ID,
  MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
};

export const MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_ERA49_OPS_SCRIPTS = [
  "ops:validate-month2-market-readiness-convergence-integrity",
  "ops:sync-month2-market-readiness-convergence-integrity-baseline",
] as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_ERA49_CI_SCRIPTS = [
  "test:ci:month2-market-readiness-convergence-integrity-era49",
] as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_ERA49_UNIT_TESTS = [
  "tests/unit/month2-market-readiness-convergence-integrity-era49.test.ts",
  "tests/unit/validate-month2-market-readiness-convergence-integrity.test.ts",
  "tests/unit/month2-market-readiness-convergence-integrity-era49-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-month2-market-readiness-convergence-era49.test.ts",
  "tests/unit/owner-daily-briefing-era25-month2-market-readiness-convergence-era49.test.ts",
] as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_ERA49_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-month2-market-readiness-convergence-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/launch-wizard/month2-market-readiness-convergence-era25-strip.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
