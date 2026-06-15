/**
 * Pilot GO/NO-GO integrity — policy wiring.
 */

import {
  PILOT_GONOGO_INTEGRITY_ERA28_POLICY_ID,
  PILOT_GONOGO_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/pilot-gono-go-integrity-era28";

export { PILOT_GONOGO_INTEGRITY_ERA28_POLICY_ID, PILOT_GONOGO_INTEGRITY_BASELINE_ARTIFACT };

export const PILOT_GONOGO_INTEGRITY_ERA28_OPS_SCRIPTS = [
  "ops:validate-pilot-gono-go-integrity",
  "ops:sync-pilot-gono-go-integrity-baseline",
] as const;

export const PILOT_GONOGO_INTEGRITY_ERA28_CI_SCRIPTS = [
  "test:ci:pilot-gono-go-integrity-era28",
] as const;

export const PILOT_GONOGO_INTEGRITY_ERA28_UNIT_TESTS = [
  "tests/unit/pilot-gono-go-integrity-era28.test.ts",
  "tests/unit/validate-pilot-gono-go-integrity.test.ts",
  "tests/unit/pilot-gono-go-integrity-era28-cert-live.test.ts",
] as const;
