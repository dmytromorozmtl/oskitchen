/**
 * Continuous improvement loop execution policy — Era 40 Step 12 orchestration layer.
 */
import { SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_POLICY_ID } from "@/lib/ops/sustained-product-evolution-execution-orchestrator";
import {
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_DOC,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_HTML_ARTIFACT,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_ORCHESTRATOR_COMMAND,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_POLICY_ID,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_STEP13_DOC,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/continuous-improvement-loop-execution-orchestrator";

export const CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_BACKLOG_ID =
  "KOS-E40-001-CONTINUOUS-IMPROVEMENT-LOOP-EXECUTION" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_EXTENDS_POLICIES = [
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_POLICY_ID,
  "era22-continuous-improvement-loop-post-sustained-ops-orchestrator-v1",
  "era34-continuous-improvement-loop-integrity-v1",
  "commercial-inflection-readiness-v1",
] as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_OPS_SCRIPTS = [
  "ops:run-continuous-improvement-loop-execution",
  "ops:run-sustained-product-evolution-execution",
  "ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator",
  "ops:validate-continuous-improvement-loop",
  "ops:validate-continuous-improvement-loop-integrity",
  "ops:validate-pure-operational-mode-terminus-era25",
  "ops:validate-maintenance-mode",
  "smoke:woo-shopify-live",
  "smoke:commerce-webhook-drill",
  "smoke:pilot-metrics-baseline",
  "smoke:pilot-gono-go",
  "smoke:competitor-feature-gap-matrix",
  "ops:run-maintenance-mode-execution",
  "ops:run-maintenance-mode-post-product-evolution-orchestrator",
] as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_CI_SCRIPTS = [
  "test:ci:continuous-improvement-loop-execution",
  "test:ci:continuous-improvement-loop-execution:cert",
] as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_UNIT_TESTS = [
  "tests/unit/continuous-improvement-loop-execution-orchestrator.test.ts",
  "tests/unit/continuous-improvement-loop-execution-cert-live.test.ts",
] as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_CANONICAL_DOC_PATHS = [
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_DOC,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_STEP13_DOC,
  "docs/next-step-10-continuous-improvement-loop-2026-05-28.md",
  "docs/feature-maturity-matrix.md",
] as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_PRODUCT_SURFACES = [
  "lib/commercial/continuous-improvement-loop-ui-era22.ts",
  "lib/commercial/maintenance-mode-ui-era24.ts",
  "components/dashboard/continuous-improvement-loop-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;

export {
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_DOC,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_HTML_ARTIFACT,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_ORCHESTRATOR_COMMAND,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_POLICY_ID,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_STEP13_DOC,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_SUMMARY_ARTIFACT,
};
