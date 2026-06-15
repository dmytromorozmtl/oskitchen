/**
 * Era25 post-terminal-seal commercial ops permanence integrity — policy wiring.
 */

import {
  ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_ERA65_POLICY_ID,
  ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-integrity-era65";

export {
  ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_ERA65_POLICY_ID,
  ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_ERA65_OPS_SCRIPTS = [
  "ops:validate-era25-post-terminal-seal-commercial-ops-permanence-integrity",
  "ops:sync-era25-post-terminal-seal-commercial-ops-permanence-integrity-baseline",
] as const;

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_ERA65_CI_SCRIPTS = [
  "test:ci:era25-post-terminal-seal-commercial-ops-permanence-integrity-era65",
  "test:ci:era25-post-terminal-seal-commercial-ops-permanence-integrity-era65:cert",
] as const;

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_ERA65_GOVERNANCE_BUNDLES_CERT_CHAIN =
  ["test:ci:era25-post-terminal-seal-commercial-ops-permanence-integrity-era65:cert"] as const;

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_ERA65_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN =
  ["test:ci:era25-post-terminal-seal-commercial-ops-permanence-integrity-era65:cert"] as const;

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_ERA65_UNIT_TESTS = [
  "tests/unit/era25-post-terminal-seal-commercial-ops-permanence-integrity-era65.test.ts",
  "tests/unit/validate-era25-post-terminal-seal-commercial-ops-permanence-integrity.test.ts",
  "tests/unit/era25-post-terminal-seal-commercial-ops-permanence-integrity-era65-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-post-terminal-seal-commercial-ops-permanence-era65.test.ts",
  "tests/unit/owner-daily-briefing-era25-post-terminal-seal-commercial-ops-permanence-era65.test.ts",
] as const;

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_ERA65_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-post-terminal-seal-commercial-ops-permanence-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
