/**
 * P0 staging proof integrity — policy wiring (CI + commercial inflection).
 */

import {
  P0_STAGING_PROOF_INTEGRITY_ERA28_POLICY_ID,
  P0_STAGING_PROOF_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/p0-staging-proof-integrity-era28";

export { P0_STAGING_PROOF_INTEGRITY_ERA28_POLICY_ID, P0_STAGING_PROOF_INTEGRITY_BASELINE_ARTIFACT };

export const P0_STAGING_PROOF_INTEGRITY_ERA28_OPS_SCRIPTS = [
  "ops:validate-p0-staging-proof-integrity",
  "ops:sync-p0-staging-proof-integrity-baseline",
] as const;

export const P0_STAGING_PROOF_INTEGRITY_ERA28_CI_SCRIPTS = [
  "test:ci:p0-staging-proof-integrity-era28",
] as const;

export const P0_STAGING_PROOF_INTEGRITY_ERA28_UNIT_TESTS = [
  "tests/unit/p0-staging-proof-integrity-era28.test.ts",
  "tests/unit/validate-p0-staging-proof-integrity.test.ts",
  "tests/unit/p0-staging-proof-integrity-era28-cert-live.test.ts",
] as const;
