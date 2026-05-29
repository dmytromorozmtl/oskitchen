/**
 * Production pilot ready closure execution policy — Era 42 Step 14 orchestration layer.
 */
import { MAINTENANCE_MODE_EXECUTION_POLICY_ID } from "@/lib/ops/maintenance-mode-execution-orchestrator";
import {
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_DOC,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_HTML_ARTIFACT,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_ORCHESTRATOR_COMMAND,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_POLICY_ID,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_STEP15_DOC,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/production-pilot-ready-closure-execution-orchestrator";

export const PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_BACKLOG_ID =
  "KOS-E42-001-PRODUCTION-PILOT-READY-CLOSURE-EXECUTION" as const;

export const PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_EXTENDS_POLICIES = [
  MAINTENANCE_MODE_EXECUTION_POLICY_ID,
  "era24-engineering-path-terminus-post-maintenance-mode-orchestrator-v1",
  "era37-engineering-path-terminus-integrity-v1",
  "commercial-inflection-readiness-v1",
] as const;

export const PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_OPS_SCRIPTS = [
  "ops:run-production-pilot-ready-closure-execution",
  "ops:run-maintenance-mode-execution",
  "run:production-pilot-ready",
  "check-vault-readiness",
  "ops:run-engineering-path-terminus-post-maintenance-mode-orchestrator",
  "ops:validate-commercial-pilot-path",
  "ops:validate-engineering-path-terminus-integrity",
  "smoke:investor-narrative-onepager",
  "smoke:pilot-case-study-draft",
  "smoke:pilot-gono-go",
  "smoke:pilot-forbidden-claims-enforcement",
  "ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator",
] as const;

export const PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_CI_SCRIPTS = [
  "test:ci:production-pilot-ready-closure-execution",
  "test:ci:production-pilot-ready-closure-execution:cert",
] as const;

export const PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_UNIT_TESTS = [
  "tests/unit/production-pilot-ready-closure-execution-orchestrator.test.ts",
  "tests/unit/production-pilot-ready-closure-execution-cert-live.test.ts",
] as const;

export const PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_CANONICAL_DOC_PATHS = [
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_DOC,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_STEP15_DOC,
  "docs/next-step-14-production-pilot-ready-closure-2026-05-29.md",
  "docs/feature-maturity-matrix.md",
] as const;

export const PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_PRODUCT_SURFACES = [
  "lib/commercial/engineering-path-terminus-ui-era24.ts",
  "lib/commercial/maintenance-mode-ui-era24.ts",
  "lib/commercial/post-terminus-steady-state-ui-era24.ts",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;

export {
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_DOC,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_HTML_ARTIFACT,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_ORCHESTRATOR_COMMAND,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_POLICY_ID,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_STEP15_DOC,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_SUMMARY_ARTIFACT,
};
