/**
 * Maintenance mode integrity — policy wiring.
 */

import {
  MAINTENANCE_MODE_INTEGRITY_ERA36_POLICY_ID,
  MAINTENANCE_MODE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/maintenance-mode-integrity-era36";

export {
  MAINTENANCE_MODE_INTEGRITY_ERA36_POLICY_ID,
  MAINTENANCE_MODE_INTEGRITY_BASELINE_ARTIFACT,
};

export const MAINTENANCE_MODE_INTEGRITY_ERA36_OPS_SCRIPTS = [
  "ops:validate-maintenance-mode-integrity",
  "ops:sync-maintenance-mode-integrity-baseline",
] as const;

export const MAINTENANCE_MODE_INTEGRITY_ERA36_CI_SCRIPTS = [
  "test:ci:maintenance-mode-integrity-era36",
] as const;

export const MAINTENANCE_MODE_INTEGRITY_ERA36_UNIT_TESTS = [
  "tests/unit/maintenance-mode-integrity-era36.test.ts",
  "tests/unit/validate-maintenance-mode-integrity.test.ts",
  "tests/unit/maintenance-mode-integrity-era36-cert-live.test.ts",
] as const;

export const MAINTENANCE_MODE_INTEGRITY_ERA36_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-maintenance-mode-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
