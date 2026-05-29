/**
 * Era25 first charter slice readiness integrity — policy wiring.
 */

import {
  ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_ERA43_POLICY_ID,
  ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-first-charter-slice-readiness-integrity-era43";

export {
  ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_ERA43_POLICY_ID,
  ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_ERA43_OPS_SCRIPTS = [
  "ops:validate-era25-first-charter-slice-readiness-integrity",
  "ops:sync-era25-first-charter-slice-readiness-integrity-baseline",
] as const;

export const ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_ERA43_CI_SCRIPTS = [
  "test:ci:era25-first-charter-slice-readiness-integrity-era43",
] as const;

export const ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_ERA43_UNIT_TESTS = [
  "tests/unit/era25-first-charter-slice-readiness-integrity-era43.test.ts",
  "tests/unit/validate-era25-first-charter-slice-readiness-integrity.test.ts",
  "tests/unit/era25-first-charter-slice-readiness-integrity-era43-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-first-charter-slice-era43.test.ts",
  "tests/unit/owner-daily-briefing-era25-first-charter-slice-era43.test.ts",
] as const;

export const ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_ERA43_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-first-charter-slice-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
