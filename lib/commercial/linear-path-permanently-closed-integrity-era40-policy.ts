/**
 * Linear path permanently closed integrity — policy wiring.
 */

import {
  LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_POLICY_ID,
  LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/linear-path-permanently-closed-integrity-era40";

export {
  LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_POLICY_ID,
  LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_BASELINE_ARTIFACT,
};

export const LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_OPS_SCRIPTS = [
  "ops:validate-linear-path-permanently-closed-integrity",
  "ops:sync-linear-path-permanently-closed-integrity-baseline",
] as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_CI_SCRIPTS = [
  "test:ci:linear-path-permanently-closed-integrity-era40",
] as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_UNIT_TESTS = [
  "tests/unit/linear-path-permanently-closed-integrity-era40.test.ts",
  "tests/unit/validate-linear-path-permanently-closed-integrity.test.ts",
  "tests/unit/linear-path-permanently-closed-integrity-era40-cert-live.test.ts",
] as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-linear-path-permanently-closed-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
