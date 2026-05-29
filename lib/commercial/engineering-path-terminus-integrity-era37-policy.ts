/**
 * Engineering path terminus integrity — policy wiring.
 */

import {
  ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_POLICY_ID,
  ENGINEERING_PATH_TERMINUS_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/engineering-path-terminus-integrity-era37";

export {
  ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_POLICY_ID,
  ENGINEERING_PATH_TERMINUS_INTEGRITY_BASELINE_ARTIFACT,
};

export const ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_OPS_SCRIPTS = [
  "ops:validate-engineering-path-terminus-integrity",
  "ops:sync-engineering-path-terminus-integrity-baseline",
] as const;

export const ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_CI_SCRIPTS = [
  "test:ci:engineering-path-terminus-integrity-era37",
] as const;

export const ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_UNIT_TESTS = [
  "tests/unit/engineering-path-terminus-integrity-era37.test.ts",
  "tests/unit/validate-engineering-path-terminus-integrity.test.ts",
  "tests/unit/engineering-path-terminus-integrity-era37-cert-live.test.ts",
] as const;

export const ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-engineering-terminus-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
