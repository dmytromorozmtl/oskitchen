/**
 * Commercial gate execution policy — Era 32 Step 4 orchestration layer.
 */
import { COMMERCIAL_GO_CLOSURE_ERA21_POLICY_ID } from "@/lib/commercial/commercial-go-closure-era21-policy";
import { COMMERCIAL_INFLECTION_READINESS_POLICY_ID } from "@/lib/commercial/commercial-inflection-readiness-era28-policy";
import { TIER2_STAGING_PROOF_EXECUTION_POLICY_ID } from "@/lib/ops/tier2-staging-proof-execution-policy";
import {
  COMMERCIAL_GATE_EXECUTION_DOC,
  COMMERCIAL_GATE_EXECUTION_HTML_ARTIFACT,
  COMMERCIAL_GATE_EXECUTION_ORCHESTRATOR_COMMAND,
  COMMERCIAL_GATE_EXECUTION_POLICY_ID,
  COMMERCIAL_GATE_EXECUTION_STEP5_DOC,
  COMMERCIAL_GATE_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/commercial-gate-execution-orchestrator";

export const COMMERCIAL_GATE_EXECUTION_BACKLOG_ID =
  "KOS-E32-001-COMMERCIAL-GATE-EXECUTION" as const;

export const COMMERCIAL_GATE_EXECUTION_EXTENDS_POLICIES = [
  TIER2_STAGING_PROOF_EXECUTION_POLICY_ID,
  COMMERCIAL_GO_CLOSURE_ERA21_POLICY_ID,
  COMMERCIAL_INFLECTION_READINESS_POLICY_ID,
  "era28-pilot-gono-go-integrity-v1",
] as const;

export const COMMERCIAL_GATE_EXECUTION_OPS_SCRIPTS = [
  "ops:run-commercial-gate-execution",
  "ops:run-commercial-go-closure-post-tier2-orchestrator",
  "ops:validate-commercial-go-closure-env",
  "icp-qualification-check",
  "smoke:pilot-forbidden-claims-enforcement",
  "smoke:pilot-gono-go",
  "ops:validate-pilot-gono-go-integrity",
  "ops:run-commercial-inflection-readiness-orchestrator",
  "run:production-pilot-ready",
] as const;

export const COMMERCIAL_GATE_EXECUTION_CI_SCRIPTS = [
  "test:ci:commercial-gate-execution",
  "test:ci:commercial-gate-execution:cert",
] as const;

export const COMMERCIAL_GATE_EXECUTION_UNIT_TESTS = [
  "tests/unit/commercial-gate-execution-orchestrator.test.ts",
  "tests/unit/commercial-gate-execution-cert-live.test.ts",
] as const;

export const COMMERCIAL_GATE_EXECUTION_CANONICAL_DOC_PATHS = [
  COMMERCIAL_GATE_EXECUTION_DOC,
  COMMERCIAL_GATE_EXECUTION_STEP5_DOC,
  "docs/era20-pilot-gono-go-blocker-playbook-2026-05-28.md",
  "config/commercial/pilot-icp-prospect-draft.template.json",
] as const;

export const COMMERCIAL_GATE_EXECUTION_PRODUCT_SURFACES = [
  "lib/commercial/commercial-go-closure-ui-era21.ts",
  "components/dashboard/commercial-go-closure-phases-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-commercial-go-closure-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;

export {
  COMMERCIAL_GATE_EXECUTION_DOC,
  COMMERCIAL_GATE_EXECUTION_HTML_ARTIFACT,
  COMMERCIAL_GATE_EXECUTION_ORCHESTRATOR_COMMAND,
  COMMERCIAL_GATE_EXECUTION_POLICY_ID,
  COMMERCIAL_GATE_EXECUTION_STEP5_DOC,
  COMMERCIAL_GATE_EXECUTION_SUMMARY_ARTIFACT,
};
