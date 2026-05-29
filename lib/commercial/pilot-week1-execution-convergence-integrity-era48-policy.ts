/**
 * Pilot week 1 execution convergence integrity — policy wiring.
 */

import {
  PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_POLICY_ID,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/pilot-week1-execution-convergence-integrity-era48";

export {
  PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_POLICY_ID,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
};

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_OPS_SCRIPTS = [
  "ops:validate-pilot-week1-execution-convergence-integrity",
  "ops:sync-pilot-week1-execution-convergence-integrity-baseline",
] as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_CI_SCRIPTS = [
  "test:ci:pilot-week1-execution-convergence-integrity-era48",
] as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_UNIT_TESTS = [
  "tests/unit/pilot-week1-execution-convergence-integrity-era48.test.ts",
  "tests/unit/validate-pilot-week1-execution-convergence-integrity.test.ts",
  "tests/unit/pilot-week1-execution-convergence-integrity-era48-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-pilot-week1-execution-convergence-era48.test.ts",
  "tests/unit/owner-daily-briefing-era25-pilot-week1-execution-convergence-era48.test.ts",
] as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-pilot-week1-execution-convergence-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/launch-wizard/pilot-week1-execution-convergence-era25-strip.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
