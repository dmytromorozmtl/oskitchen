/**
 * Era25 first product slice blueprint integrity — policy wiring.
 */

import {
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_ERA45_POLICY_ID,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-first-product-slice-blueprint-integrity-era45";

export {
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_ERA45_POLICY_ID,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_ERA45_OPS_SCRIPTS = [
  "ops:validate-era25-first-product-slice-blueprint-integrity",
  "ops:sync-era25-first-product-slice-blueprint-integrity-baseline",
] as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_ERA45_CI_SCRIPTS = [
  "test:ci:era25-first-product-slice-blueprint-integrity-era45",
] as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_ERA45_UNIT_TESTS = [
  "tests/unit/era25-first-product-slice-blueprint-integrity-era45.test.ts",
  "tests/unit/validate-era25-first-product-slice-blueprint-integrity.test.ts",
  "tests/unit/era25-first-product-slice-blueprint-integrity-era45-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-first-product-slice-blueprint-era45.test.ts",
  "tests/unit/owner-daily-briefing-era25-first-product-slice-blueprint-era45.test.ts",
] as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_ERA45_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-first-product-slice-blueprint-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
