/**
 * Continuous improvement loop integrity — policy wiring.
 */

import {
  CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_POLICY_ID,
  CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/continuous-improvement-loop-integrity-era34";

export {
  CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_POLICY_ID,
  CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_BASELINE_ARTIFACT,
};

export const CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_OPS_SCRIPTS = [
  "ops:validate-continuous-improvement-loop-integrity",
  "ops:sync-continuous-improvement-loop-integrity-baseline",
] as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_CI_SCRIPTS = [
  "test:ci:continuous-improvement-loop-integrity-era34",
] as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_UNIT_TESTS = [
  "tests/unit/continuous-improvement-loop-integrity-era34.test.ts",
  "tests/unit/validate-continuous-improvement-loop-integrity.test.ts",
  "tests/unit/continuous-improvement-loop-integrity-era34-cert-live.test.ts",
] as const;
