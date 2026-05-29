/**
 * Sustained product evolution re-entrant integrity — policy wiring.
 */

import {
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_POLICY_ID,
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/sustained-product-evolution-re-entrant-integrity-era56";

export {
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_POLICY_ID,
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_BASELINE_ARTIFACT,
};

export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_OPS_SCRIPTS = [
  "ops:validate-sustained-product-evolution-re-entrant-integrity",
  "ops:sync-sustained-product-evolution-re-entrant-integrity-baseline",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_CI_SCRIPTS = [
  "test:ci:sustained-product-evolution-re-entrant-integrity-era56",
  "test:ci:sustained-product-evolution-re-entrant-integrity-era56:cert",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_COMMERCIAL_PILOT_RUNBOOK_CERT_CHAIN =
  ["test:ci:sustained-product-evolution-re-entrant-integrity-era56:cert"] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_UNIT_TESTS = [
  "tests/unit/sustained-product-evolution-re-entrant-integrity-era56.test.ts",
  "tests/unit/validate-sustained-product-evolution-re-entrant-integrity.test.ts",
  "tests/unit/sustained-product-evolution-re-entrant-integrity-era56-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-sustained-product-evolution-re-entrant-era56.test.ts",
  "tests/unit/owner-daily-briefing-era25-sustained-product-evolution-re-entrant-era56.test.ts",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-sustained-product-evolution-re-entrant-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
