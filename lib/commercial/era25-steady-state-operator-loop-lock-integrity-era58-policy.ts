/**
 * Era25 steady-state operator loop lock integrity — policy wiring.
 */

import {
  ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_ERA58_POLICY_ID,
  ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-steady-state-operator-loop-lock-integrity-era58";

export {
  ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_ERA58_POLICY_ID,
  ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_ERA58_OPS_SCRIPTS = [
  "ops:validate-era25-steady-state-operator-loop-lock-integrity",
  "ops:sync-era25-steady-state-operator-loop-lock-integrity-baseline",
] as const;

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_ERA58_CI_SCRIPTS = [
  "test:ci:era25-steady-state-operator-loop-lock-integrity-era58",
  "test:ci:era25-steady-state-operator-loop-lock-integrity-era58:cert",
] as const;

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_ERA58_GOVERNANCE_BUNDLES_CERT_CHAIN = [
  "test:ci:era25-steady-state-operator-loop-lock-integrity-era58:cert",
] as const;

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_ERA58_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN =
  ["test:ci:era25-steady-state-operator-loop-lock-integrity-era58:cert"] as const;

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_ERA58_UNIT_TESTS = [
  "tests/unit/era25-steady-state-operator-loop-lock-integrity-era58.test.ts",
  "tests/unit/validate-era25-steady-state-operator-loop-lock-integrity.test.ts",
  "tests/unit/era25-steady-state-operator-loop-lock-integrity-era58-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-steady-state-operator-loop-lock-era58.test.ts",
  "tests/unit/owner-daily-briefing-era25-steady-state-operator-loop-lock-era58.test.ts",
] as const;

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_ERA58_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-steady-state-operator-loop-lock-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
