/**
 * Maintenance mode execution policy — Era 41 Step 13 orchestration layer.
 */
import { CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_POLICY_ID } from "@/lib/ops/continuous-improvement-loop-execution-orchestrator";
import {
  MAINTENANCE_MODE_EXECUTION_DOC,
  MAINTENANCE_MODE_EXECUTION_HTML_ARTIFACT,
  MAINTENANCE_MODE_EXECUTION_ORCHESTRATOR_COMMAND,
  MAINTENANCE_MODE_EXECUTION_POLICY_ID,
  MAINTENANCE_MODE_EXECUTION_STEP14_DOC,
  MAINTENANCE_MODE_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/maintenance-mode-execution-orchestrator";

export const MAINTENANCE_MODE_EXECUTION_BACKLOG_ID =
  "KOS-E41-001-MAINTENANCE-MODE-EXECUTION" as const;

export const MAINTENANCE_MODE_EXECUTION_EXTENDS_POLICIES = [
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_POLICY_ID,
  "era24-maintenance-mode-post-product-evolution-orchestrator-v1",
  "era36-maintenance-mode-integrity-v1",
  "commercial-inflection-readiness-v1",
] as const;

export const MAINTENANCE_MODE_EXECUTION_OPS_SCRIPTS = [
  "ops:run-maintenance-mode-execution",
  "ops:run-continuous-improvement-loop-execution",
  "ops:run-maintenance-mode-post-product-evolution-orchestrator",
  "ops:validate-maintenance-mode",
  "ops:validate-maintenance-mode-integrity",
  "ops:validate-sustained-product-evolution-re-entrant-integrity",
  "ops:validate-era25-post-re-entrant-charter-lock-integrity",
  "smoke:woo-shopify-live",
  "smoke:pilot-metrics-baseline",
  "smoke:pilot-gono-go",
  "ops:run-engineering-path-terminus-post-maintenance-mode-orchestrator",
] as const;

export const MAINTENANCE_MODE_EXECUTION_CI_SCRIPTS = [
  "test:ci:maintenance-mode-execution",
  "test:ci:maintenance-mode-execution:cert",
] as const;

export const MAINTENANCE_MODE_EXECUTION_UNIT_TESTS = [
  "tests/unit/maintenance-mode-execution-orchestrator.test.ts",
  "tests/unit/maintenance-mode-execution-cert-live.test.ts",
] as const;

export const MAINTENANCE_MODE_EXECUTION_CANONICAL_DOC_PATHS = [
  MAINTENANCE_MODE_EXECUTION_DOC,
  MAINTENANCE_MODE_EXECUTION_STEP14_DOC,
  "docs/next-step-12-commercial-pilot-path-complete-2026-05-28.md",
  "docs/next-step-13-maintenance-mode-execution-2026-05-29.md",
] as const;

export const MAINTENANCE_MODE_EXECUTION_PRODUCT_SURFACES = [
  "lib/commercial/maintenance-mode-ui-era24.ts",
  "lib/commercial/engineering-path-terminus-ui-era24.ts",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;

export {
  MAINTENANCE_MODE_EXECUTION_DOC,
  MAINTENANCE_MODE_EXECUTION_HTML_ARTIFACT,
  MAINTENANCE_MODE_EXECUTION_ORCHESTRATOR_COMMAND,
  MAINTENANCE_MODE_EXECUTION_POLICY_ID,
  MAINTENANCE_MODE_EXECUTION_STEP14_DOC,
  MAINTENANCE_MODE_EXECUTION_SUMMARY_ARTIFACT,
};
