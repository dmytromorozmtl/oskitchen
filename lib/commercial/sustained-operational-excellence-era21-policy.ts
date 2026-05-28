/**
 * Sustained operational excellence — Era 21 Step 9 product + CLI wiring.
 */

import { SUSTAINED_OPERATIONAL_EXCELLENCE_PHASES_ERA21_POLICY_ID } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { SUSTAINED_OPERATIONAL_EXCELLENCE_UI_ERA21_POLICY_ID } from "@/lib/commercial/sustained-operational-excellence-ui-era21";

export const SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_POLICY_ID =
  "era21-sustained-operational-excellence-v1" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_BACKLOG_ID = "KOS-E21-009" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_EXTENDS_POLICIES = [
  "era21-market-leader-positioning-v1",
  SUSTAINED_OPERATIONAL_EXCELLENCE_PHASES_ERA21_POLICY_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_UI_ERA21_POLICY_ID,
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_OPS_SCRIPTS = [
  "ops:validate-sustained-operational-excellence-env",
  "ops:export-sustained-operational-excellence-env-template",
  "ops:sync-sustained-operational-excellence-progress-report",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_CI_SCRIPTS = [
  "test:ci:sustained-operational-excellence-era21",
  "test:ci:sustained-operational-excellence-era21:cert",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_UNIT_TESTS = [
  "tests/unit/sustained-operational-excellence-phases-era21.test.ts",
  "tests/unit/sustained-operational-excellence-ui-era21.test.ts",
  "tests/unit/owner-daily-briefing-sustained-operational-excellence-era21.test.ts",
  "tests/unit/sustained-operational-excellence-era21-cert-live.test.ts",
  "tests/unit/validate-sustained-operational-excellence-env.test.ts",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_PRODUCT_SURFACES = [
  "components/dashboard/sustained-operational-excellence-phases-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-commercial-blockers-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
