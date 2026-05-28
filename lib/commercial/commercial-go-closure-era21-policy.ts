/**
 * Commercial GO closure — Era 21 Step 3 product + CLI wiring.
 */

import { COMMERCIAL_GO_CLOSURE_PHASES_ERA21_POLICY_ID } from "@/lib/commercial/commercial-go-closure-phases-era21";
import { COMMERCIAL_GO_CLOSURE_UI_ERA21_POLICY_ID } from "@/lib/commercial/commercial-go-closure-ui-era21";

export const COMMERCIAL_GO_CLOSURE_ERA21_POLICY_ID = "era21-commercial-go-closure-v1" as const;

export const COMMERCIAL_GO_CLOSURE_ERA21_BACKLOG_ID = "KOS-E21-003" as const;

export const COMMERCIAL_GO_CLOSURE_ERA21_EXTENDS_POLICIES = [
  "era17-pilot-gono-go-v1",
  COMMERCIAL_GO_CLOSURE_PHASES_ERA21_POLICY_ID,
  COMMERCIAL_GO_CLOSURE_UI_ERA21_POLICY_ID,
  "era21-commercial-go-closure-post-tier2-orchestrator-v1",
] as const;

export const COMMERCIAL_GO_CLOSURE_ERA21_OPS_SCRIPTS = [
  "ops:run-commercial-go-closure-post-tier2-orchestrator",
  "ops:validate-commercial-go-closure-env",
  "ops:export-commercial-go-closure-env-template",
  "ops:export-commercial-go-closure-readiness-checklist",
  "ops:sync-commercial-go-closure-progress-report",
] as const;

export const COMMERCIAL_GO_CLOSURE_ERA21_CI_SCRIPTS = [
  "test:ci:commercial-go-closure-era21",
  "test:ci:commercial-go-closure-era21:cert",
] as const;

export const COMMERCIAL_GO_CLOSURE_ERA21_UNIT_TESTS = [
  "tests/unit/commercial-go-closure-post-tier2-orchestrator-era21.test.ts",
  "tests/unit/commercial-go-closure-phases-era21.test.ts",
  "tests/unit/commercial-go-closure-ui-era21.test.ts",
  "tests/unit/owner-daily-briefing-commercial-go-closure-era21.test.ts",
  "tests/unit/run-commercial-go-closure-post-tier2-orchestrator.test.ts",
  "tests/unit/commercial-go-closure-era21-cert-live.test.ts",
] as const;

export const COMMERCIAL_GO_CLOSURE_ERA21_PRODUCT_SURFACES = [
  "components/dashboard/commercial-go-closure-phases-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-commercial-blockers-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
