/**
 * Era25 commercial pilot convergence train capstone integrity — policy wiring.
 */

import {
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_ERA59_POLICY_ID,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-capstone-integrity-era59";

export {
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_ERA59_POLICY_ID,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_ERA59_OPS_SCRIPTS = [
  "ops:validate-era25-commercial-pilot-convergence-train-capstone-integrity",
  "ops:sync-era25-commercial-pilot-convergence-train-capstone-integrity-baseline",
] as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_ERA59_CI_SCRIPTS = [
  "test:ci:era25-commercial-pilot-convergence-train-capstone-integrity-era59",
  "test:ci:era25-commercial-pilot-convergence-train-capstone-integrity-era59:cert",
] as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_ERA59_GOVERNANCE_BUNDLES_CERT_CHAIN =
  ["test:ci:era25-commercial-pilot-convergence-train-capstone-integrity-era59:cert"] as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_ERA59_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN =
  ["test:ci:era25-commercial-pilot-convergence-train-capstone-integrity-era59:cert"] as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_ERA59_UNIT_TESTS = [
  "tests/unit/era25-commercial-pilot-convergence-train-capstone-integrity-era59.test.ts",
  "tests/unit/validate-era25-commercial-pilot-convergence-train-capstone-integrity.test.ts",
  "tests/unit/era25-commercial-pilot-convergence-train-capstone-integrity-era59-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-commercial-pilot-convergence-train-capstone-era59.test.ts",
  "tests/unit/owner-daily-briefing-era25-commercial-pilot-convergence-train-capstone-era59.test.ts",
] as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_ERA59_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-commercial-pilot-convergence-train-capstone-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
