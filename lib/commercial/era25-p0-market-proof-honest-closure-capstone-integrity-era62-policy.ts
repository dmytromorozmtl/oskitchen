/**
 * Era25 P0 market proof honest closure capstone integrity — policy wiring.
 */

import {
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_POLICY_ID,
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-integrity-era62";

export {
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_POLICY_ID,
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_OPS_SCRIPTS = [
  "ops:validate-era25-p0-market-proof-honest-closure-capstone-integrity",
  "ops:sync-era25-p0-market-proof-honest-closure-capstone-integrity-baseline",
] as const;

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_CI_SCRIPTS = [
  "test:ci:era25-p0-market-proof-honest-closure-capstone-integrity-era62",
  "test:ci:era25-p0-market-proof-honest-closure-capstone-integrity-era62:cert",
] as const;

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_GOVERNANCE_BUNDLES_CERT_CHAIN =
  ["test:ci:era25-p0-market-proof-honest-closure-capstone-integrity-era62:cert"] as const;

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN =
  ["test:ci:era25-p0-market-proof-honest-closure-capstone-integrity-era62:cert"] as const;

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_UNIT_TESTS = [
  "tests/unit/era25-p0-market-proof-honest-closure-capstone-integrity-era62.test.ts",
  "tests/unit/validate-era25-p0-market-proof-honest-closure-capstone-integrity.test.ts",
  "tests/unit/era25-p0-market-proof-honest-closure-capstone-integrity-era62-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-p0-market-proof-honest-closure-capstone-era62.test.ts",
  "tests/unit/owner-daily-briefing-era25-p0-market-proof-honest-closure-capstone-era62.test.ts",
] as const;

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-p0-market-proof-honest-closure-capstone-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
