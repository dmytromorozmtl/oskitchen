/**
 * Sustained product evolution integrity — policy wiring.
 */

import {
  SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_POLICY_ID,
  SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/sustained-product-evolution-integrity-era35";

export {
  SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_POLICY_ID,
  SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_BASELINE_ARTIFACT,
};

export const SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_OPS_SCRIPTS = [
  "ops:validate-sustained-product-evolution-integrity",
  "ops:sync-sustained-product-evolution-integrity-baseline",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_CI_SCRIPTS = [
  "test:ci:sustained-product-evolution-integrity-era35",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_UNIT_TESTS = [
  "tests/unit/sustained-product-evolution-integrity-era35.test.ts",
  "tests/unit/validate-sustained-product-evolution-integrity.test.ts",
  "tests/unit/sustained-product-evolution-integrity-era35-cert-live.test.ts",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-product-evolution-panel.tsx",
  "components/dashboard/sustained-product-evolution-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
