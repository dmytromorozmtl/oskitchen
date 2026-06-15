/**
 * Era25 post-steady-product-mode commercial ops rhythm permanence integrity — policy wiring.
 */

import {
  ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_ERA68_POLICY_ID,
  ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-era68";

export {
  ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_ERA68_POLICY_ID,
  ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_ERA68_OPS_SCRIPTS =
  [
    "ops:validate-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity",
    "ops:sync-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-baseline",
  ] as const;

export const ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_ERA68_CI_SCRIPTS =
  [
    "test:ci:era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-era68",
    "test:ci:era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-era68:cert",
  ] as const;

export const ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_ERA68_GOVERNANCE_BUNDLES_CERT_CHAIN =
  [
    "test:ci:era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-era68:cert",
  ] as const;

export const ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_ERA68_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN =
  [
    "test:ci:era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-era68:cert",
  ] as const;

export const ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_ERA68_UNIT_TESTS =
  [
    "tests/unit/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-era68.test.ts",
    "tests/unit/validate-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity.test.ts",
    "tests/unit/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-era68-cert-live.test.ts",
    "tests/unit/launch-wizard-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-era68.test.ts",
    "tests/unit/owner-daily-briefing-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-era68.test.ts",
  ] as const;

export const ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_ERA68_PRODUCT_SURFACES =
  [
    "components/dashboard/launch-wizard/launch-wizard-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-panel.tsx",
    "components/dashboard/maintenance-mode-panel.tsx",
    "components/dashboard/owner-daily-briefing-hero.tsx",
    "components/platform/commercial-pilot-ops-status-panel.tsx",
  ] as const;
