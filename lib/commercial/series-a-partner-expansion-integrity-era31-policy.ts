/**
 * Series A / partner expansion integrity — policy wiring.
 */

import {
  SERIES_A_PARTNER_EXPANSION_INTEGRITY_ERA31_POLICY_ID,
  SERIES_A_PARTNER_EXPANSION_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/series-a-partner-expansion-integrity-era31";

export {
  SERIES_A_PARTNER_EXPANSION_INTEGRITY_ERA31_POLICY_ID,
  SERIES_A_PARTNER_EXPANSION_INTEGRITY_BASELINE_ARTIFACT,
};

export const SERIES_A_PARTNER_EXPANSION_INTEGRITY_ERA31_OPS_SCRIPTS = [
  "ops:validate-series-a-partner-expansion-integrity",
  "ops:sync-series-a-partner-expansion-integrity-baseline",
] as const;

export const SERIES_A_PARTNER_EXPANSION_INTEGRITY_ERA31_CI_SCRIPTS = [
  "test:ci:series-a-partner-expansion-integrity-era31",
] as const;

export const SERIES_A_PARTNER_EXPANSION_INTEGRITY_ERA31_UNIT_TESTS = [
  "tests/unit/series-a-partner-expansion-integrity-era31.test.ts",
  "tests/unit/validate-series-a-partner-expansion-integrity.test.ts",
  "tests/unit/series-a-partner-expansion-integrity-era31-cert-live.test.ts",
] as const;
