/**
 * Era 142 — P0 orchestrator PASS wiring cert (Phase 10 #69).
 *
 * Full path: vault gate → child smokes → p0ArtifactOverall PASSED.
 */

import {
  FINAL_02_P0_ORCHESTRATOR_ARTIFACT_POLICY_ID,
  P0_ORCHESTRATOR_REQUIRED_STEP_IDS,
  P0_ORCHESTRATOR_STAGING_RUN_ARTIFACT,
} from "@/lib/execution/final-02-p0-orchestrator-artifact-audit-policy";
import { P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_POLICY_ID } from "@/lib/ops/p0-staging-proof-execution-orchestrator";

export const P0_ORCHESTRATOR_PASS_ERA142_POLICY_ID = "era142-p0-orchestrator-pass-v1" as const;

export const P0_ORCHESTRATOR_PASS_ERA142_SUMMARY_ARTIFACT =
  "artifacts/p0-orchestrator-pass-smoke-summary.json" as const;

export const P0_ORCHESTRATOR_PASS_ERA142_NPM_SCRIPT = "smoke:p0-orchestrator-pass-era142" as const;

export const P0_ORCHESTRATOR_PASS_ERA142_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-p0-orchestrator-pass-era142.ts" as const;

export const P0_ORCHESTRATOR_PASS_ERA142_OPS_DOC = "docs/p0-orchestrator-pass-era142-setup.md" as const;

export const P0_ORCHESTRATOR_PASS_ERA142_VAULT_ARTIFACT =
  "artifacts/vault-readiness-report.json" as const;

export const P0_ORCHESTRATOR_PASS_ERA142_WIRING_PATHS = [
  "lib/ops/p0-staging-proof-execution-orchestrator.ts",
  "lib/execution/final-02-p0-orchestrator-artifact-audit-policy.ts",
  "lib/ops/vault-readiness-report.ts",
  "scripts/run-p0-orchestrator-staging.sh",
  ".github/workflows/p0-orchestrator.yml",
] as const;

export const P0_ORCHESTRATOR_PASS_ERA142_CYCLE_RUNBOOK_STEPS = [
  "Ensure all 11 ops vault secrets are present — see docs/ops-vault-matrix.md.",
  "Run ./scripts/run-p0-orchestrator-staging.sh — all 7 QA-01 steps PASS.",
  "Verify artifacts/vault-readiness-report.json → p0ArtifactOverall: PASSED.",
  "Verify artifacts/p0-orchestrator-staging-run-summary.json → overall: PASS.",
  "Run npm run smoke:p0-orchestrator-pass-era142 — artifact overall PASSED.",
] as const;

export const P0_ORCHESTRATOR_PASS_ERA142_CI_SCRIPTS = [
  "test:ci:p0-orchestrator-pass-era142",
  "test:ci:p0-orchestrator-pass-era142:cert",
] as const;

export const P0_ORCHESTRATOR_PASS_ERA142_UNIT_TESTS = [
  "tests/unit/p0-orchestrator-pass-era142.test.ts",
  "tests/unit/final-02-p0-orchestrator-artifact-audit-policy.test.ts",
] as const;

export const P0_ORCHESTRATOR_PASS_ERA142_CANONICAL_P0_POLICY_ID =
  P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_POLICY_ID;

export const P0_ORCHESTRATOR_PASS_ERA142_FINAL02_POLICY_ID =
  FINAL_02_P0_ORCHESTRATOR_ARTIFACT_POLICY_ID;

export const P0_ORCHESTRATOR_PASS_ERA142_STAGING_RUN_ARTIFACT =
  P0_ORCHESTRATOR_STAGING_RUN_ARTIFACT;

export const P0_ORCHESTRATOR_PASS_ERA142_REQUIRED_STEPS = P0_ORCHESTRATOR_REQUIRED_STEP_IDS;

export const P0_ORCHESTRATOR_PASS_ERA142_CAPABILITIES = [
  "vault_gate",
  "child_smokes",
  "p0_aggregate",
] as const;
