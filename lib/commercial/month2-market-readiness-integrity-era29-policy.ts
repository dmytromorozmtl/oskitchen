/**
 * Month 2 market readiness integrity — policy wiring.
 */

import {
  MONTH2_MARKET_READINESS_INTEGRITY_ERA29_POLICY_ID,
  MONTH2_MARKET_READINESS_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/month2-market-readiness-integrity-era29";

export {
  MONTH2_MARKET_READINESS_INTEGRITY_ERA29_POLICY_ID,
  MONTH2_MARKET_READINESS_INTEGRITY_BASELINE_ARTIFACT,
};

export const MONTH2_MARKET_READINESS_INTEGRITY_ERA29_OPS_SCRIPTS = [
  "ops:validate-month2-market-readiness-integrity",
  "ops:sync-month2-market-readiness-integrity-baseline",
] as const;

export const MONTH2_MARKET_READINESS_INTEGRITY_ERA29_CI_SCRIPTS = [
  "test:ci:month2-market-readiness-integrity-era29",
] as const;

export const MONTH2_MARKET_READINESS_INTEGRITY_ERA29_UNIT_TESTS = [
  "tests/unit/month2-market-readiness-integrity-era29.test.ts",
  "tests/unit/validate-month2-market-readiness-integrity.test.ts",
  "tests/unit/month2-market-readiness-integrity-era29-cert-live.test.ts",
] as const;
