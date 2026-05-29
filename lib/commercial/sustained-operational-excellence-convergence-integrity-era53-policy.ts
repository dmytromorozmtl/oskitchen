/**
 * Sustained operational excellence convergence integrity — policy wiring.
 */

import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_POLICY_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/sustained-operational-excellence-convergence-integrity-era53";

export {
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_POLICY_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
};

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_OPS_SCRIPTS = [
  "ops:validate-sustained-operational-excellence-convergence-integrity",
  "ops:sync-sustained-operational-excellence-convergence-integrity-baseline",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_CI_SCRIPTS = [
  "test:ci:sustained-operational-excellence-convergence-integrity-era53",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_UNIT_TESTS = [
  "tests/unit/sustained-operational-excellence-convergence-integrity-era53.test.ts",
  "tests/unit/validate-sustained-operational-excellence-convergence-integrity.test.ts",
  "tests/unit/sustained-operational-excellence-convergence-integrity-era53-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-sustained-operational-excellence-convergence-era53.test.ts",
  "tests/unit/owner-daily-briefing-era25-sustained-operational-excellence-convergence-era53.test.ts",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-sustained-operational-excellence-convergence-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
