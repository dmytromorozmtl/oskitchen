/**
 * Post-terminus steady state — Era 24 Step 14 process orchestration policy.
 */

import {
  POST_TERMINUS_STEADY_STATE_PHASES_ERA24_POLICY_ID,
  POST_TERMINUS_STEADY_STATE_STEP14_DOC,
} from "@/lib/commercial/post-terminus-steady-state-phases-era24";
import { POST_TERMINUS_STEADY_STATE_UI_ERA24_POLICY_ID } from "@/lib/commercial/post-terminus-steady-state-ui-era24";

export const POST_TERMINUS_STEADY_STATE_ERA24_POLICY_ID =
  "era24-post-terminus-steady-state-v1" as const;

export { POST_TERMINUS_STEADY_STATE_STEP14_DOC };

export const POST_TERMINUS_STEADY_STATE_ERA24_BACKLOG_ID = "KOS-E24-014" as const;

export const POST_TERMINUS_STEADY_STATE_ERA24_EXTENDS_POLICIES = [
  "era24-engineering-path-terminus-v1",
  "era24-commercial-pilot-path-absolute-end-v1",
  POST_TERMINUS_STEADY_STATE_PHASES_ERA24_POLICY_ID,
  POST_TERMINUS_STEADY_STATE_UI_ERA24_POLICY_ID,
  "era24-post-terminus-steady-state-post-engineering-terminus-orchestrator-v1",
] as const;

export const POST_TERMINUS_STEADY_STATE_ERA24_OPS_SCRIPTS = [
  "ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator",
  "ops:validate-steady-state-operator-loop",
  "ops:sync-steady-state-operator-loop-report",
  "ops:export-era-charter-readiness-checklist",
] as const;

export const POST_TERMINUS_STEADY_STATE_ERA24_CI_SCRIPTS = [
  "test:ci:post-terminus-steady-state-era24",
  "test:ci:post-terminus-steady-state-era24:cert",
] as const;

export const POST_TERMINUS_STEADY_STATE_ERA24_UNIT_TESTS = [
  "tests/unit/post-terminus-steady-state-post-engineering-terminus-orchestrator-era24.test.ts",
  "tests/unit/post-terminus-steady-state-phases-era24.test.ts",
  "tests/unit/post-terminus-steady-state-ui-era24.test.ts",
  "tests/unit/run-post-terminus-steady-state-post-engineering-terminus-orchestrator.test.ts",
  "tests/unit/validate-steady-state-operator-loop.test.ts",
  "tests/unit/post-terminus-steady-state-era24-cert-live.test.ts",
] as const;

export const POST_TERMINUS_STEADY_STATE_ERA24_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
