/**
 * Era25 convergence governance terminus freeze integrity — policy wiring.
 */

import {
  ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_POLICY_ID,
  ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-convergence-governance-terminus-freeze-integrity-era60";

export {
  ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_POLICY_ID,
  ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_OPS_SCRIPTS = [
  "ops:validate-era25-convergence-governance-terminus-freeze-integrity",
  "ops:sync-era25-convergence-governance-terminus-freeze-integrity-baseline",
] as const;

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_CI_SCRIPTS = [
  "test:ci:era25-convergence-governance-terminus-freeze-integrity-era60",
  "test:ci:era25-convergence-governance-terminus-freeze-integrity-era60:cert",
] as const;

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_GOVERNANCE_BUNDLES_CERT_CHAIN =
  ["test:ci:era25-convergence-governance-terminus-freeze-integrity-era60:cert"] as const;

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN =
  ["test:ci:era25-convergence-governance-terminus-freeze-integrity-era60:cert"] as const;

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_UNIT_TESTS = [
  "tests/unit/era25-convergence-governance-terminus-freeze-integrity-era60.test.ts",
  "tests/unit/validate-era25-convergence-governance-terminus-freeze-integrity.test.ts",
  "tests/unit/era25-convergence-governance-terminus-freeze-integrity-era60-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-convergence-governance-terminus-freeze-era60.test.ts",
  "tests/unit/owner-daily-briefing-era25-convergence-governance-terminus-freeze-era60.test.ts",
] as const;

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-convergence-governance-terminus-freeze-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
