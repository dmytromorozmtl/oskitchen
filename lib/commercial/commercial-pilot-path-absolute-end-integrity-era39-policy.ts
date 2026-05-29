/**
 * Commercial pilot path absolute end integrity — policy wiring.
 */

import {
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_POLICY_ID,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-integrity-era39";

export {
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_POLICY_ID,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_BASELINE_ARTIFACT,
};

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_OPS_SCRIPTS = [
  "ops:validate-commercial-pilot-path-absolute-end-integrity",
  "ops:sync-commercial-pilot-path-absolute-end-integrity-baseline",
] as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_CI_SCRIPTS = [
  "test:ci:commercial-pilot-path-absolute-end-integrity-era39",
] as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_UNIT_TESTS = [
  "tests/unit/commercial-pilot-path-absolute-end-integrity-era39.test.ts",
  "tests/unit/validate-commercial-pilot-path-absolute-end-integrity.test.ts",
  "tests/unit/commercial-pilot-path-absolute-end-integrity-era39-cert-live.test.ts",
] as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-commercial-pilot-path-absolute-end-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
