/**
 * Scale readiness integrity — policy wiring.
 */

import {
  SCALE_READINESS_INTEGRITY_ERA30_POLICY_ID,
  SCALE_READINESS_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/scale-readiness-integrity-era30";

export {
  SCALE_READINESS_INTEGRITY_ERA30_POLICY_ID,
  SCALE_READINESS_INTEGRITY_BASELINE_ARTIFACT,
};

export const SCALE_READINESS_INTEGRITY_ERA30_OPS_SCRIPTS = [
  "ops:validate-scale-readiness-integrity",
  "ops:sync-scale-readiness-integrity-baseline",
] as const;

export const SCALE_READINESS_INTEGRITY_ERA30_CI_SCRIPTS = [
  "test:ci:scale-readiness-integrity-era30",
] as const;

export const SCALE_READINESS_INTEGRITY_ERA30_UNIT_TESTS = [
  "tests/unit/scale-readiness-integrity-era30.test.ts",
  "tests/unit/validate-scale-readiness-integrity.test.ts",
  "tests/unit/scale-readiness-integrity-era30-cert-live.test.ts",
] as const;
