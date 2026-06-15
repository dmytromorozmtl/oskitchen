/**
 * Sustained operational excellence integrity — policy wiring.
 */

import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_ERA33_POLICY_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/sustained-operational-excellence-integrity-era33";

export {
  SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_ERA33_POLICY_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_BASELINE_ARTIFACT,
};

export const SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_ERA33_OPS_SCRIPTS = [
  "ops:validate-sustained-operational-excellence-integrity",
  "ops:sync-sustained-operational-excellence-integrity-baseline",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_ERA33_CI_SCRIPTS = [
  "test:ci:sustained-operational-excellence-integrity-era33",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_ERA33_UNIT_TESTS = [
  "tests/unit/sustained-operational-excellence-integrity-era33.test.ts",
  "tests/unit/validate-sustained-operational-excellence-integrity.test.ts",
  "tests/unit/sustained-operational-excellence-integrity-era33-cert-live.test.ts",
] as const;
