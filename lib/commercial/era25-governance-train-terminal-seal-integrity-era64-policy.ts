/**
 * Era25 governance train terminal seal integrity — policy wiring.
 */

import {
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_POLICY_ID,
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-governance-train-terminal-seal-integrity-era64";

export {
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_POLICY_ID,
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_OPS_SCRIPTS = [
  "ops:validate-era25-governance-train-terminal-seal-integrity",
  "ops:sync-era25-governance-train-terminal-seal-integrity-baseline",
] as const;

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_CI_SCRIPTS = [
  "test:ci:era25-governance-train-terminal-seal-integrity-era64",
  "test:ci:era25-governance-train-terminal-seal-integrity-era64:cert",
] as const;

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_GOVERNANCE_BUNDLES_CERT_CHAIN =
  ["test:ci:era25-governance-train-terminal-seal-integrity-era64:cert"] as const;

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN =
  ["test:ci:era25-governance-train-terminal-seal-integrity-era64:cert"] as const;

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_UNIT_TESTS = [
  "tests/unit/era25-governance-train-terminal-seal-integrity-era64.test.ts",
  "tests/unit/validate-era25-governance-train-terminal-seal-integrity.test.ts",
  "tests/unit/era25-governance-train-terminal-seal-integrity-era64-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-governance-train-terminal-seal-era64.test.ts",
  "tests/unit/owner-daily-briefing-era25-governance-train-terminal-seal-era64.test.ts",
] as const;

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-governance-train-terminal-seal-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
