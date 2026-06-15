/**
 * Era25 commercial pilot convergence train closure integrity — policy wiring.
 */

import {
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_POLICY_ID,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-integrity-era55";

export {
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_POLICY_ID,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_OPS_SCRIPTS = [
  "ops:validate-era25-commercial-pilot-convergence-train-closure-integrity",
  "ops:sync-era25-commercial-pilot-convergence-train-closure-integrity-baseline",
] as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_CI_SCRIPTS = [
  "test:ci:era25-commercial-pilot-convergence-train-closure-integrity-era55",
  "test:ci:era25-commercial-pilot-convergence-train-closure-integrity-era55:cert",
] as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN =
  ["test:ci:era25-commercial-pilot-convergence-train-closure-integrity-era55:cert"] as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_UNIT_TESTS = [
  "tests/unit/era25-commercial-pilot-convergence-train-closure-integrity-era55.test.ts",
  "tests/unit/validate-era25-commercial-pilot-convergence-train-closure-integrity.test.ts",
  "tests/unit/era25-commercial-pilot-convergence-train-closure-integrity-era55-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-commercial-pilot-convergence-train-closure-era55.test.ts",
  "tests/unit/owner-daily-briefing-era25-commercial-pilot-convergence-train-closure-era55.test.ts",
] as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-commercial-pilot-convergence-train-closure-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
