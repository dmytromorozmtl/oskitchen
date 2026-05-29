/**
 * Sustained operational excellence — Era 21 Step 9 product + CLI wiring.
 */

import { SUSTAINED_OPERATIONAL_EXCELLENCE_PHASES_ERA21_POLICY_ID } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
/** Inline — avoids policy → ui → ops → policy TDZ at build time. */
const SUSTAINED_OPERATIONAL_EXCELLENCE_UI_ERA21_POLICY_ID = "era21-sustained-operational-excellence-ui-v1" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_POLICY_ID =
  "era21-sustained-operational-excellence-v1" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_BACKLOG_ID = "KOS-E21-009" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_EXTENDS_POLICIES = [
  "era21-market-leader-positioning-v1",
  SUSTAINED_OPERATIONAL_EXCELLENCE_PHASES_ERA21_POLICY_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_UI_ERA21_POLICY_ID,
  "era21-sustained-operational-excellence-post-market-leader-orchestrator-v1",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_OPS_SCRIPTS = [
  "ops:run-sustained-operational-excellence-execution",
  "ops:run-market-leader-positioning-execution",
  "ops:run-sustained-operational-excellence-post-market-leader-orchestrator",
  "ops:validate-sustained-operational-excellence-env",
  "ops:validate-sustained-operational-excellence-integrity",
  "ops:sync-sustained-operational-excellence-integrity-baseline",
  "ops:export-sustained-operational-excellence-env-template",
  "ops:export-sustained-operational-excellence-readiness-checklist",
  "ops:sync-sustained-operational-excellence-progress-report",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_CI_SCRIPTS = [
  "test:ci:sustained-operational-excellence-execution",
  "test:ci:sustained-operational-excellence-execution:cert",
  "test:ci:sustained-operational-excellence-era21",
  "test:ci:sustained-operational-excellence-era21:cert",
  "test:ci:sustained-operational-excellence-integrity-era33",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_UNIT_TESTS = [
  "tests/unit/sustained-operational-excellence-execution-orchestrator.test.ts",
  "tests/unit/sustained-operational-excellence-execution-cert-live.test.ts",
  "tests/unit/sustained-operational-excellence-post-market-leader-orchestrator-era21.test.ts",
  "tests/unit/sustained-operational-excellence-phases-era21.test.ts",
  "tests/unit/sustained-operational-excellence-ui-era21.test.ts",
  "tests/unit/owner-daily-briefing-sustained-operational-excellence-era21.test.ts",
  "tests/unit/run-sustained-operational-excellence-post-market-leader-orchestrator.test.ts",
  "tests/unit/sustained-operational-excellence-era21-cert-live.test.ts",
  "tests/unit/validate-sustained-operational-excellence-env.test.ts",
  "tests/unit/sustained-operational-excellence-integrity-era33.test.ts",
  "tests/unit/validate-sustained-operational-excellence-integrity.test.ts",
  "tests/unit/sustained-operational-excellence-integrity-era33-cert-live.test.ts",
  "tests/unit/launch-wizard-sustained-ops-era33.test.ts",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_PRODUCT_SURFACES = [
  "components/dashboard/sustained-operational-excellence-phases-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-commercial-blockers-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-sustained-ops-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-view.tsx",
  "components/dashboard/launch-wizard/launch-wizard-today-strip.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
