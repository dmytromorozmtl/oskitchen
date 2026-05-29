/**
 * Pilot scale expansion execution policy — Era 34 Step 6 orchestration layer.
 */
import { PILOT_WEEK1_EXECUTION_ORCHESTRATOR_POLICY_ID } from "@/lib/ops/pilot-week1-execution-orchestrator";
import { SCALE_READINESS_ERA21_POLICY_ID } from "@/lib/commercial/scale-readiness-era21-policy";
import {
  PILOT_SCALE_EXPANSION_EXECUTION_DOC,
  PILOT_SCALE_EXPANSION_EXECUTION_HTML_ARTIFACT,
  PILOT_SCALE_EXPANSION_EXECUTION_ORCHESTRATOR_COMMAND,
  PILOT_SCALE_EXPANSION_EXECUTION_POLICY_ID,
  PILOT_SCALE_EXPANSION_EXECUTION_STEP7_DOC,
  PILOT_SCALE_EXPANSION_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";

export const PILOT_SCALE_EXPANSION_EXECUTION_BACKLOG_ID =
  "KOS-E34-001-PILOT-SCALE-EXPANSION-EXECUTION" as const;

export const PILOT_SCALE_EXPANSION_EXECUTION_EXTENDS_POLICIES = [
  PILOT_WEEK1_EXECUTION_ORCHESTRATOR_POLICY_ID,
  SCALE_READINESS_ERA21_POLICY_ID,
  "era30-scale-readiness-integrity-v1",
  "commercial-inflection-readiness-v1",
] as const;

export const PILOT_SCALE_EXPANSION_EXECUTION_OPS_SCRIPTS = [
  "ops:run-pilot-scale-expansion-execution",
  "ops:run-scale-readiness-post-month2-orchestrator",
  "ops:validate-scale-readiness-env",
  "ops:validate-scale-readiness-integrity",
  "smoke:pilot-metrics-baseline",
  "ops:run-commercial-inflection-readiness-orchestrator",
  "run:production-pilot-ready",
] as const;

export const PILOT_SCALE_EXPANSION_EXECUTION_CI_SCRIPTS = [
  "test:ci:pilot-scale-expansion-execution",
  "test:ci:pilot-scale-expansion-execution:cert",
] as const;

export const PILOT_SCALE_EXPANSION_EXECUTION_UNIT_TESTS = [
  "tests/unit/pilot-scale-expansion-execution-orchestrator.test.ts",
  "tests/unit/pilot-scale-expansion-execution-cert-live.test.ts",
] as const;

export const PILOT_SCALE_EXPANSION_EXECUTION_CANONICAL_DOC_PATHS = [
  PILOT_SCALE_EXPANSION_EXECUTION_DOC,
  PILOT_SCALE_EXPANSION_EXECUTION_STEP7_DOC,
  "docs/next-step-6-scale-readiness-2026-05-28.md",
  "docs/feature-maturity-matrix.md",
] as const;

export const PILOT_SCALE_EXPANSION_EXECUTION_PRODUCT_SURFACES = [
  "lib/commercial/scale-readiness-ui-era21.ts",
  "components/dashboard/scale-readiness-phases-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;

export {
  PILOT_SCALE_EXPANSION_EXECUTION_DOC,
  PILOT_SCALE_EXPANSION_EXECUTION_HTML_ARTIFACT,
  PILOT_SCALE_EXPANSION_EXECUTION_ORCHESTRATOR_COMMAND,
  PILOT_SCALE_EXPANSION_EXECUTION_POLICY_ID,
  PILOT_SCALE_EXPANSION_EXECUTION_STEP7_DOC,
  PILOT_SCALE_EXPANSION_EXECUTION_SUMMARY_ARTIFACT,
};
