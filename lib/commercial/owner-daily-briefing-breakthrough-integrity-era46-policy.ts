/**
 * Owner daily briefing breakthrough integrity — policy wiring.
 */

import {
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_POLICY_ID,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-integrity-era46";

export {
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_POLICY_ID,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_BASELINE_ARTIFACT,
};

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_OPS_SCRIPTS = [
  "ops:validate-owner-daily-briefing-breakthrough-integrity",
  "ops:sync-owner-daily-briefing-breakthrough-integrity-baseline",
] as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_CI_SCRIPTS = [
  "test:ci:owner-daily-briefing-breakthrough-integrity-era46",
] as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_UNIT_TESTS = [
  "tests/unit/owner-daily-briefing-breakthrough-integrity-era46.test.ts",
  "tests/unit/validate-owner-daily-briefing-breakthrough-integrity.test.ts",
  "tests/unit/owner-daily-briefing-breakthrough-integrity-era46-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-owner-daily-briefing-breakthrough-era46.test.ts",
  "tests/unit/owner-daily-briefing-era25-owner-daily-briefing-breakthrough-era46.test.ts",
] as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-owner-daily-briefing-breakthrough-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-breakthrough-era25-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
