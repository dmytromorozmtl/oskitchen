/**
 * Series A partner expansion convergence integrity — policy wiring.
 */

import {
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_POLICY_ID,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/series-a-partner-expansion-convergence-integrity-era51";

export {
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_POLICY_ID,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
};

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_OPS_SCRIPTS = [
  "ops:validate-series-a-partner-expansion-convergence-integrity",
  "ops:sync-series-a-partner-expansion-convergence-integrity-baseline",
] as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_CI_SCRIPTS = [
  "test:ci:series-a-partner-expansion-convergence-integrity-era51",
] as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_UNIT_TESTS = [
  "tests/unit/series-a-partner-expansion-convergence-integrity-era51.test.ts",
  "tests/unit/validate-series-a-partner-expansion-convergence-integrity.test.ts",
  "tests/unit/series-a-partner-expansion-convergence-integrity-era51-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-series-a-partner-expansion-convergence-era51.test.ts",
  "tests/unit/owner-daily-briefing-era25-series-a-partner-expansion-convergence-era51.test.ts",
] as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-series-a-partner-expansion-convergence-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
