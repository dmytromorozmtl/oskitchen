/**
 * Tier 2 staging golden path integrity — policy wiring.
 */

import {
  TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_POLICY_ID,
  TIER2_STAGING_GOLDEN_PATH_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/tier2-staging-golden-path-integrity-era28";

export { TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_POLICY_ID, TIER2_STAGING_GOLDEN_PATH_INTEGRITY_BASELINE_ARTIFACT };

export const TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_OPS_SCRIPTS = [
  "ops:validate-tier2-staging-golden-path-integrity",
  "ops:sync-tier2-staging-golden-path-integrity-baseline",
] as const;

export const TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_CI_SCRIPTS = [
  "test:ci:tier2-staging-golden-path-integrity-era28",
] as const;

export const TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_UNIT_TESTS = [
  "tests/unit/tier2-staging-golden-path-integrity-era28.test.ts",
  "tests/unit/validate-tier2-staging-golden-path-integrity.test.ts",
  "tests/unit/tier2-staging-golden-path-integrity-era28-cert-live.test.ts",
] as const;
