/**
 * Era25 Band A market proof execution sole-path integrity — policy wiring.
 */

import {
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_POLICY_ID,
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-integrity-era61";

export {
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_POLICY_ID,
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_OPS_SCRIPTS = [
  "ops:validate-era25-band-a-market-proof-execution-sole-path-integrity",
  "ops:sync-era25-band-a-market-proof-execution-sole-path-integrity-baseline",
] as const;

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_CI_SCRIPTS = [
  "test:ci:era25-band-a-market-proof-execution-sole-path-integrity-era61",
  "test:ci:era25-band-a-market-proof-execution-sole-path-integrity-era61:cert",
] as const;

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_GOVERNANCE_BUNDLES_CERT_CHAIN =
  ["test:ci:era25-band-a-market-proof-execution-sole-path-integrity-era61:cert"] as const;

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN =
  ["test:ci:era25-band-a-market-proof-execution-sole-path-integrity-era61:cert"] as const;

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_UNIT_TESTS = [
  "tests/unit/era25-band-a-market-proof-execution-sole-path-integrity-era61.test.ts",
  "tests/unit/validate-era25-band-a-market-proof-execution-sole-path-integrity.test.ts",
  "tests/unit/era25-band-a-market-proof-execution-sole-path-integrity-era61-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-band-a-market-proof-execution-sole-path-era61.test.ts",
  "tests/unit/owner-daily-briefing-era25-band-a-market-proof-execution-sole-path-era61.test.ts",
] as const;

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-band-a-market-proof-execution-sole-path-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
