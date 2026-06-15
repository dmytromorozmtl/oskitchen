/**
 * Scale readiness convergence integrity — policy wiring.
 */

import {
  SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_POLICY_ID,
  SCALE_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/scale-readiness-convergence-integrity-era50";

export {
  SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_POLICY_ID,
  SCALE_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
};

export const SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_OPS_SCRIPTS = [
  "ops:validate-scale-readiness-convergence-integrity",
  "ops:sync-scale-readiness-convergence-integrity-baseline",
] as const;

export const SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_CI_SCRIPTS = [
  "test:ci:scale-readiness-convergence-integrity-era50",
] as const;

export const SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_UNIT_TESTS = [
  "tests/unit/scale-readiness-convergence-integrity-era50.test.ts",
  "tests/unit/validate-scale-readiness-convergence-integrity.test.ts",
  "tests/unit/scale-readiness-convergence-integrity-era50-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-scale-readiness-convergence-era50.test.ts",
  "tests/unit/owner-daily-briefing-era25-scale-readiness-convergence-era50.test.ts",
] as const;

export const SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-scale-readiness-convergence-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/launch-wizard/scale-readiness-convergence-era25-strip.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
