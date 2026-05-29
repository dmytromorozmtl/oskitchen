/**
 * Continuous improvement loop — Era 22 Step 10 product + CLI wiring (post-era21).
 */

import { CONTINUOUS_IMPROVEMENT_LOOP_PHASES_ERA22_POLICY_ID } from "@/lib/commercial/continuous-improvement-loop-phases-era22";
/** Inline — avoids policy → ui → ops → policy TDZ at build time. */
const CONTINUOUS_IMPROVEMENT_LOOP_UI_ERA22_POLICY_ID = "era22-continuous-improvement-loop-ui-v1" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_ERA22_POLICY_ID =
  "era22-continuous-improvement-loop-v1" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_ERA22_BACKLOG_ID = "KOS-E22-010" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_ERA22_EXTENDS_POLICIES = [
  "era21-sustained-operational-excellence-v1",
  CONTINUOUS_IMPROVEMENT_LOOP_PHASES_ERA22_POLICY_ID,
  CONTINUOUS_IMPROVEMENT_LOOP_UI_ERA22_POLICY_ID,
  "era22-continuous-improvement-loop-post-sustained-ops-orchestrator-v1",
] as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_ERA22_OPS_SCRIPTS = [
  "ops:run-continuous-improvement-loop-execution",
  "ops:run-sustained-product-evolution-execution",
  "ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator",
  "ops:validate-continuous-improvement-loop",
  "ops:validate-continuous-improvement-loop-integrity",
  "ops:sync-continuous-improvement-loop-integrity-baseline",
  "ops:sync-continuous-improvement-loop-progress-report",
  "ops:export-continuous-improvement-loop-release-checklist",
] as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_ERA22_CI_SCRIPTS = [
  "test:ci:continuous-improvement-loop-execution",
  "test:ci:continuous-improvement-loop-execution:cert",
  "test:ci:continuous-improvement-loop-era22",
  "test:ci:continuous-improvement-loop-era22:cert",
  "test:ci:continuous-improvement-loop-integrity-era34",
] as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_ERA22_UNIT_TESTS = [
  "tests/unit/continuous-improvement-loop-execution-orchestrator.test.ts",
  "tests/unit/continuous-improvement-loop-execution-cert-live.test.ts",
  "tests/unit/continuous-improvement-loop-post-sustained-ops-orchestrator-era22.test.ts",
  "tests/unit/continuous-improvement-loop-phases-era22.test.ts",
  "tests/unit/continuous-improvement-loop-ui-era22.test.ts",
  "tests/unit/run-continuous-improvement-loop-post-sustained-ops-orchestrator.test.ts",
  "tests/unit/validate-continuous-improvement-loop.test.ts",
  "tests/unit/continuous-improvement-loop-era22-cert-live.test.ts",
  "tests/unit/continuous-improvement-loop-integrity-era34.test.ts",
  "tests/unit/validate-continuous-improvement-loop-integrity.test.ts",
  "tests/unit/continuous-improvement-loop-integrity-era34-cert-live.test.ts",
  "tests/unit/launch-wizard-improvement-loop-era34.test.ts",
  "tests/unit/owner-daily-briefing-continuous-improvement-loop-era34.test.ts",
] as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_ERA22_PRODUCT_SURFACES = [
  "components/dashboard/continuous-improvement-loop-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-improvement-loop-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-view.tsx",
  "components/dashboard/launch-wizard/launch-wizard-today-strip.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
