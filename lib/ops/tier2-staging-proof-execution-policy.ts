/**
 * Tier 2 staging proof execution policy — Era 31 Step 3 orchestration layer.
 */
import { TIER2_STAGING_GOLDEN_PATH_ERA20_POLICY_ID } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import { TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_POLICY_ID } from "@/lib/commercial/tier2-staging-golden-path-integrity-era28-policy";
import { P0_STAGING_PROOF_EXECUTION_POLICY_ID } from "@/lib/ops/p0-staging-proof-execution-policy";
import {
  TIER2_STAGING_PROOF_EXECUTION_DOC,
  TIER2_STAGING_PROOF_EXECUTION_HTML_ARTIFACT,
  TIER2_STAGING_PROOF_EXECUTION_ORCHESTRATOR_COMMAND,
  TIER2_STAGING_PROOF_EXECUTION_POLICY_ID,
  TIER2_STAGING_PROOF_EXECUTION_STEP4_DOC,
  TIER2_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/tier2-staging-proof-execution-orchestrator";

export const TIER2_STAGING_PROOF_EXECUTION_BACKLOG_ID =
  "KOS-E31-001-TIER2-STAGING-PROOF-EXECUTION" as const;

export const TIER2_STAGING_PROOF_EXECUTION_EXTENDS_POLICIES = [
  P0_STAGING_PROOF_EXECUTION_POLICY_ID,
  TIER2_STAGING_GOLDEN_PATH_ERA20_POLICY_ID,
  TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_POLICY_ID,
  "era21-tier2-golden-path-post-p0-orchestrator-v1",
] as const;

export const TIER2_STAGING_PROOF_EXECUTION_OPS_SCRIPTS = [
  "ops:run-tier2-staging-proof-execution",
  "ops:run-tier2-golden-path-post-p0-orchestrator",
  "ops:validate-tier2-golden-path-env",
  "ops:validate-tier2-staging-golden-path-integrity",
  "smoke:tier2-staging-golden-path",
  "smoke:kds-staging-playwright",
  "icp-qualification-check",
  "smoke:pilot-gono-go",
] as const;

export const TIER2_STAGING_PROOF_EXECUTION_CI_SCRIPTS = [
  "test:ci:tier2-staging-proof-execution",
  "test:ci:tier2-staging-proof-execution:cert",
] as const;

export const TIER2_STAGING_PROOF_EXECUTION_UNIT_TESTS = [
  "tests/unit/tier2-staging-proof-execution-orchestrator.test.ts",
  "tests/unit/tier2-staging-proof-execution-cert-live.test.ts",
] as const;

export const TIER2_STAGING_PROOF_EXECUTION_CANONICAL_DOC_PATHS = [
  TIER2_STAGING_PROOF_EXECUTION_DOC,
  TIER2_STAGING_PROOF_EXECUTION_STEP4_DOC,
  "docs/tier2-staging-golden-path-execution-playbook-2026-05-28.md",
] as const;

export const TIER2_STAGING_PROOF_EXECUTION_PRODUCT_SURFACES = [
  "lib/commercial/tier2-staging-golden-path-ui-era21.ts",
  "components/dashboard/tier2-golden-path-phases-panel.tsx",
  "components/dashboard/integration-health-tier2-golden-path-banner.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;

export {
  TIER2_STAGING_PROOF_EXECUTION_DOC,
  TIER2_STAGING_PROOF_EXECUTION_HTML_ARTIFACT,
  TIER2_STAGING_PROOF_EXECUTION_ORCHESTRATOR_COMMAND,
  TIER2_STAGING_PROOF_EXECUTION_POLICY_ID,
  TIER2_STAGING_PROOF_EXECUTION_STEP4_DOC,
  TIER2_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT,
};
