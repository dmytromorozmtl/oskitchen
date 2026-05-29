/**
 * Era25 Band A governance chain capstone witness integrity — policy wiring.
 */

import {
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_POLICY_ID,
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-integrity-era66";

export {
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_POLICY_ID,
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_OPS_SCRIPTS = [
  "ops:validate-era25-band-a-governance-chain-capstone-witness-integrity",
  "ops:sync-era25-band-a-governance-chain-capstone-witness-integrity-baseline",
] as const;

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_CI_SCRIPTS = [
  "test:ci:era25-band-a-governance-chain-capstone-witness-integrity-era66",
  "test:ci:era25-band-a-governance-chain-capstone-witness-integrity-era66:cert",
] as const;

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_GOVERNANCE_BUNDLES_CERT_CHAIN =
  ["test:ci:era25-band-a-governance-chain-capstone-witness-integrity-era66:cert"] as const;

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN =
  ["test:ci:era25-band-a-governance-chain-capstone-witness-integrity-era66:cert"] as const;

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_UNIT_TESTS = [
  "tests/unit/era25-band-a-governance-chain-capstone-witness-integrity-era66.test.ts",
  "tests/unit/validate-era25-band-a-governance-chain-capstone-witness-integrity.test.ts",
  "tests/unit/era25-band-a-governance-chain-capstone-witness-integrity-era66-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-band-a-governance-chain-capstone-witness-era66.test.ts",
  "tests/unit/owner-daily-briefing-era25-band-a-governance-chain-capstone-witness-era66.test.ts",
] as const;

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-band-a-governance-chain-capstone-witness-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
