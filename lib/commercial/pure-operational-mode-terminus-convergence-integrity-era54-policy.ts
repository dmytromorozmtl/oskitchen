/**
 * Pure operational mode terminus convergence integrity — policy wiring.
 */

import {
  PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_POLICY_ID,
  PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/pure-operational-mode-terminus-convergence-integrity-era54";

export {
  PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_POLICY_ID,
  PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
};

export const PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_OPS_SCRIPTS = [
  "ops:validate-pure-operational-mode-terminus-convergence-integrity",
  "ops:sync-pure-operational-mode-terminus-convergence-integrity-baseline",
] as const;

export const PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_CI_SCRIPTS = [
  "test:ci:pure-operational-mode-terminus-convergence-integrity-era54",
] as const;

export const PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_UNIT_TESTS = [
  "tests/unit/pure-operational-mode-terminus-convergence-integrity-era54.test.ts",
  "tests/unit/validate-pure-operational-mode-terminus-convergence-integrity.test.ts",
  "tests/unit/pure-operational-mode-terminus-convergence-integrity-era54-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-pure-operational-mode-terminus-era54.test.ts",
  "tests/unit/owner-daily-briefing-era25-pure-operational-mode-terminus-era54.test.ts",
] as const;

export const PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-pure-operational-mode-terminus-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
