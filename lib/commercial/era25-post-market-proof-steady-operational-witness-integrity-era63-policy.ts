/**
 * Era25 post-market-proof steady operational witness integrity — policy wiring.
 */

import {
  ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_ERA63_POLICY_ID,
  ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-integrity-era63";

export {
  ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_ERA63_POLICY_ID,
  ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_ERA63_OPS_SCRIPTS = [
  "ops:validate-era25-post-market-proof-steady-operational-witness-integrity",
  "ops:sync-era25-post-market-proof-steady-operational-witness-integrity-baseline",
] as const;

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_ERA63_CI_SCRIPTS = [
  "test:ci:era25-post-market-proof-steady-operational-witness-integrity-era63",
  "test:ci:era25-post-market-proof-steady-operational-witness-integrity-era63:cert",
] as const;

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_ERA63_GOVERNANCE_BUNDLES_CERT_CHAIN =
  ["test:ci:era25-post-market-proof-steady-operational-witness-integrity-era63:cert"] as const;

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_ERA63_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN =
  ["test:ci:era25-post-market-proof-steady-operational-witness-integrity-era63:cert"] as const;

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_ERA63_UNIT_TESTS = [
  "tests/unit/era25-post-market-proof-steady-operational-witness-integrity-era63.test.ts",
  "tests/unit/validate-era25-post-market-proof-steady-operational-witness-integrity.test.ts",
  "tests/unit/era25-post-market-proof-steady-operational-witness-integrity-era63-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-post-market-proof-steady-operational-witness-era63.test.ts",
  "tests/unit/owner-daily-briefing-era25-post-market-proof-steady-operational-witness-era63.test.ts",
] as const;

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_ERA63_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-post-market-proof-steady-operational-witness-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
