/**
 * Pilot Week 1 execution integrity — policy wiring.
 */

import {
  PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_POLICY_ID,
  PILOT_WEEK1_EXECUTION_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/pilot-week1-execution-integrity-era28";

export {
  PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_POLICY_ID,
  PILOT_WEEK1_EXECUTION_INTEGRITY_BASELINE_ARTIFACT,
};

export const PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_OPS_SCRIPTS = [
  "ops:validate-pilot-week1-execution-integrity",
  "ops:sync-pilot-week1-execution-integrity-baseline",
] as const;

export const PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_CI_SCRIPTS = [
  "test:ci:pilot-week1-execution-integrity-era28",
] as const;

export const PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_UNIT_TESTS = [
  "tests/unit/pilot-week1-execution-integrity-era28.test.ts",
  "tests/unit/validate-pilot-week1-execution-integrity.test.ts",
  "tests/unit/pilot-week1-execution-integrity-era28-cert-live.test.ts",
] as const;
