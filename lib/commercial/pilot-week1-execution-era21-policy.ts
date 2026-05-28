/**
 * Pilot Week 1 execution — Era 21 Step 4 product + CLI wiring.
 */

import { PILOT_WEEK1_EXECUTION_PHASES_ERA21_POLICY_ID } from "@/lib/commercial/pilot-week1-execution-phases-era21";
import { PILOT_WEEK1_EXECUTION_UI_ERA21_POLICY_ID } from "@/lib/commercial/pilot-week1-execution-ui-era21";

export const PILOT_WEEK1_EXECUTION_ERA21_POLICY_ID = "era21-pilot-week1-execution-v1" as const;

export const PILOT_WEEK1_EXECUTION_ERA21_BACKLOG_ID = "KOS-E21-004" as const;

export const PILOT_WEEK1_EXECUTION_ERA21_EXTENDS_POLICIES = [
  "era17-pilot-metrics-baseline-v1",
  "era17-pilot-case-study-draft-v1",
  PILOT_WEEK1_EXECUTION_PHASES_ERA21_POLICY_ID,
  PILOT_WEEK1_EXECUTION_UI_ERA21_POLICY_ID,
  "era21-pilot-week1-execution-post-go-orchestrator-v1",
] as const;

export const PILOT_WEEK1_EXECUTION_ERA21_OPS_SCRIPTS = [
  "ops:run-pilot-week1-execution-post-go-orchestrator",
  "ops:validate-pilot-week1-env",
  "ops:export-pilot-week1-env-template",
  "ops:export-pilot-week1-readiness-checklist",
  "ops:sync-pilot-week1-progress-report",
] as const;

export const PILOT_WEEK1_EXECUTION_ERA21_CI_SCRIPTS = [
  "test:ci:pilot-week1-execution-era21",
  "test:ci:pilot-week1-execution-era21:cert",
] as const;

export const PILOT_WEEK1_EXECUTION_ERA21_UNIT_TESTS = [
  "tests/unit/pilot-week1-execution-post-go-orchestrator-era21.test.ts",
  "tests/unit/pilot-week1-execution-phases-era21.test.ts",
  "tests/unit/pilot-week1-execution-ui-era21.test.ts",
  "tests/unit/owner-daily-briefing-pilot-week1-era21.test.ts",
  "tests/unit/run-pilot-week1-execution-post-go-orchestrator.test.ts",
  "tests/unit/pilot-week1-execution-era21-cert-live.test.ts",
] as const;

export const PILOT_WEEK1_EXECUTION_ERA21_PRODUCT_SURFACES = [
  "components/dashboard/pilot-week1-phases-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-commercial-blockers-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
  "components/dashboard/integration-health-pilot-week1-banner.tsx",
] as const;
