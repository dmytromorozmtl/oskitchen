/**
 * Paid pilot GO convergence integrity — policy wiring.
 */

import {
  PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_POLICY_ID,
  PAID_PILOT_GO_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/paid-pilot-go-convergence-integrity-era47";

export {
  PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_POLICY_ID,
  PAID_PILOT_GO_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
};

export const PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_OPS_SCRIPTS = [
  "ops:validate-paid-pilot-go-convergence-integrity",
  "ops:sync-paid-pilot-go-convergence-integrity-baseline",
] as const;

export const PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_CI_SCRIPTS = [
  "test:ci:paid-pilot-go-convergence-integrity-era47",
] as const;

export const PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_UNIT_TESTS = [
  "tests/unit/paid-pilot-go-convergence-integrity-era47.test.ts",
  "tests/unit/validate-paid-pilot-go-convergence-integrity.test.ts",
  "tests/unit/paid-pilot-go-convergence-integrity-era47-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-paid-pilot-go-convergence-era47.test.ts",
  "tests/unit/owner-daily-briefing-era25-paid-pilot-go-convergence-era47.test.ts",
] as const;

export const PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-paid-pilot-go-convergence-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/launch-wizard/paid-pilot-go-convergence-era25-strip.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
