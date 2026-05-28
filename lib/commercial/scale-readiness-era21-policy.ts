/**
 * Scale readiness — Era 21 Step 6 product + CLI wiring.
 */

import { SCALE_READINESS_PHASES_ERA21_POLICY_ID } from "@/lib/commercial/scale-readiness-phases-era21";
import { SCALE_READINESS_UI_ERA21_POLICY_ID } from "@/lib/commercial/scale-readiness-ui-era21";

export const SCALE_READINESS_ERA21_POLICY_ID = "era21-scale-readiness-v1" as const;

export const SCALE_READINESS_ERA21_BACKLOG_ID = "KOS-E21-006" as const;

export const SCALE_READINESS_ERA21_EXTENDS_POLICIES = [
  "era17-pilot-rollback-drill-v1",
  "era17-investor-narrative-onepager-v2-v1",
  SCALE_READINESS_PHASES_ERA21_POLICY_ID,
  SCALE_READINESS_UI_ERA21_POLICY_ID,
] as const;

export const SCALE_READINESS_ERA21_OPS_SCRIPTS = [
  "ops:validate-scale-readiness-env",
  "ops:export-scale-readiness-env-template",
  "ops:sync-scale-readiness-progress-report",
] as const;

export const SCALE_READINESS_ERA21_CI_SCRIPTS = [
  "test:ci:scale-readiness-era21",
  "test:ci:scale-readiness-era21:cert",
] as const;

export const SCALE_READINESS_ERA21_UNIT_TESTS = [
  "tests/unit/scale-readiness-phases-era21.test.ts",
  "tests/unit/scale-readiness-ui-era21.test.ts",
  "tests/unit/owner-daily-briefing-scale-readiness-era21.test.ts",
  "tests/unit/scale-readiness-era21-cert-live.test.ts",
] as const;

export const SCALE_READINESS_ERA21_PRODUCT_SURFACES = [
  "components/dashboard/scale-readiness-phases-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-commercial-blockers-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
