/**
 * Era25 charter exit outside linear path integrity — policy wiring.
 */

import {
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_POLICY_ID,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-charter-exit-outside-linear-path-integrity-era42";

export {
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_POLICY_ID,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_OPS_SCRIPTS = [
  "ops:validate-era25-charter-exit-outside-linear-path-integrity",
  "ops:sync-era25-charter-exit-outside-linear-path-integrity-baseline",
] as const;

export const ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_CI_SCRIPTS = [
  "test:ci:era25-charter-exit-outside-linear-path-integrity-era42",
] as const;

export const ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_UNIT_TESTS = [
  "tests/unit/era25-charter-exit-outside-linear-path-integrity-era42.test.ts",
  "tests/unit/validate-era25-charter-exit-outside-linear-path-integrity.test.ts",
  "tests/unit/era25-charter-exit-outside-linear-path-integrity-era42-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-charter-exit-era42.test.ts",
  "tests/unit/owner-daily-briefing-era25-charter-exit-era42.test.ts",
] as const;

export const ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-charter-exit-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
