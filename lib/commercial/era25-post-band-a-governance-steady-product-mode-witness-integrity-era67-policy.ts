/**
 * Era25 post-band-a-governance steady product mode witness integrity — policy wiring.
 */

import {
  ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_ERA67_POLICY_ID,
  ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-integrity-era67";

export {
  ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_ERA67_POLICY_ID,
  ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_ERA67_OPS_SCRIPTS = [
  "ops:validate-era25-post-band-a-governance-steady-product-mode-witness-integrity",
  "ops:sync-era25-post-band-a-governance-steady-product-mode-witness-integrity-baseline",
] as const;

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_ERA67_CI_SCRIPTS = [
  "test:ci:era25-post-band-a-governance-steady-product-mode-witness-integrity-era67",
  "test:ci:era25-post-band-a-governance-steady-product-mode-witness-integrity-era67:cert",
] as const;

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_ERA67_GOVERNANCE_BUNDLES_CERT_CHAIN =
  ["test:ci:era25-post-band-a-governance-steady-product-mode-witness-integrity-era67:cert"] as const;

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_ERA67_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN =
  ["test:ci:era25-post-band-a-governance-steady-product-mode-witness-integrity-era67:cert"] as const;

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_ERA67_UNIT_TESTS = [
  "tests/unit/era25-post-band-a-governance-steady-product-mode-witness-integrity-era67.test.ts",
  "tests/unit/validate-era25-post-band-a-governance-steady-product-mode-witness-integrity.test.ts",
  "tests/unit/era25-post-band-a-governance-steady-product-mode-witness-integrity-era67-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-post-band-a-governance-steady-product-mode-witness-era67.test.ts",
  "tests/unit/owner-daily-briefing-era25-post-band-a-governance-steady-product-mode-witness-era67.test.ts",
] as const;

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_ERA67_PRODUCT_SURFACES =
  [
    "components/dashboard/launch-wizard/launch-wizard-era25-post-band-a-governance-steady-product-mode-witness-panel.tsx",
    "components/dashboard/maintenance-mode-panel.tsx",
    "components/dashboard/owner-daily-briefing-hero.tsx",
    "components/platform/commercial-pilot-ops-status-panel.tsx",
  ] as const;
