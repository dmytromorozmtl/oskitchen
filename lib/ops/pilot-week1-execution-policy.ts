/**
 * Pilot Week 1 execution policy — Era 33 Step 5 orchestration layer.
 */
import { COMMERCIAL_GATE_EXECUTION_POLICY_ID } from "@/lib/ops/commercial-gate-execution-policy";
import { PILOT_WEEK1_EXECUTION_ERA21_POLICY_ID } from "@/lib/commercial/pilot-week1-execution-era21-policy";
import {
  PILOT_WEEK1_EXECUTION_DOC,
  PILOT_WEEK1_EXECUTION_HTML_ARTIFACT,
  PILOT_WEEK1_EXECUTION_ORCHESTRATOR_COMMAND,
  PILOT_WEEK1_EXECUTION_ORCHESTRATOR_POLICY_ID,
  PILOT_WEEK1_EXECUTION_STEP6_DOC,
  PILOT_WEEK1_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/pilot-week1-execution-orchestrator";

export const PILOT_WEEK1_EXECUTION_BACKLOG_ID = "KOS-E33-001-PILOT-WEEK1-EXECUTION" as const;

export const PILOT_WEEK1_EXECUTION_EXTENDS_POLICIES = [
  COMMERCIAL_GATE_EXECUTION_POLICY_ID,
  PILOT_WEEK1_EXECUTION_ERA21_POLICY_ID,
  "era28-pilot-week1-execution-integrity-v1",
  "era17-pilot-operator-golden-path-v1",
  "era17-pilot-rollback-drill-v1",
] as const;

export const PILOT_WEEK1_EXECUTION_OPS_SCRIPTS = [
  "ops:run-pilot-week1-execution",
  "ops:run-pilot-week1-execution-post-go-orchestrator",
  "ops:validate-pilot-week1-env",
  "ops:validate-pilot-week1-execution-integrity",
  "smoke:pilot-operator-golden-path",
  "smoke:pilot-metrics-baseline",
  "smoke:pilot-rollback-drill",
  "smoke:pilot-case-study-draft",
  "run:production-pilot-ready",
] as const;

export const PILOT_WEEK1_EXECUTION_CI_SCRIPTS = [
  "test:ci:pilot-week1-execution-orchestrator",
  "test:ci:pilot-week1-execution-orchestrator:cert",
] as const;

export const PILOT_WEEK1_EXECUTION_UNIT_TESTS = [
  "tests/unit/pilot-week1-execution-orchestrator.test.ts",
  "tests/unit/pilot-week1-execution-orchestrator-cert-live.test.ts",
] as const;

export const PILOT_WEEK1_EXECUTION_CANONICAL_DOC_PATHS = [
  PILOT_WEEK1_EXECUTION_DOC,
  PILOT_WEEK1_EXECUTION_STEP6_DOC,
  "docs/next-step-4-pilot-week1-execution-2026-05-28.md",
] as const;

export const PILOT_WEEK1_EXECUTION_PRODUCT_SURFACES = [
  "lib/commercial/pilot-week1-execution-ui-era21.ts",
  "components/dashboard/pilot-week1-phases-panel.tsx",
  "components/dashboard/integration-health-pilot-week1-banner.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;

export {
  PILOT_WEEK1_EXECUTION_DOC,
  PILOT_WEEK1_EXECUTION_HTML_ARTIFACT,
  PILOT_WEEK1_EXECUTION_ORCHESTRATOR_COMMAND,
  PILOT_WEEK1_EXECUTION_ORCHESTRATOR_POLICY_ID,
  PILOT_WEEK1_EXECUTION_STEP6_DOC,
  PILOT_WEEK1_EXECUTION_SUMMARY_ARTIFACT,
};
