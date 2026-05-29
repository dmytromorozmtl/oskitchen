/**
 * P0 staging proof execution policy — Era 30 Step 2 orchestration layer.
 */
import { P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { VAULT_READINESS_POLICY_ID } from "@/lib/ops/vault-readiness-policy";
import {
  P0_STAGING_PROOF_EXECUTION_DOC,
  P0_STAGING_PROOF_EXECUTION_HTML_ARTIFACT,
  P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_COMMAND,
  P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_POLICY_ID,
  P0_STAGING_PROOF_EXECUTION_STEP3_DOC,
  P0_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/p0-staging-proof-execution-orchestrator";

export const P0_STAGING_PROOF_EXECUTION_POLICY_ID =
  P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_POLICY_ID;

export const P0_STAGING_PROOF_EXECUTION_BACKLOG_ID = "KOS-E30-001-P0-STAGING-PROOF-EXECUTION" as const;

export const P0_STAGING_PROOF_EXECUTION_EXTENDS_POLICIES = [
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
  VAULT_READINESS_POLICY_ID,
  "era28-p0-staging-proof-integrity-v1",
] as const;

export const P0_STAGING_PROOF_EXECUTION_OPS_SCRIPTS = [
  "ops:run-p0-staging-proof-execution",
  "smoke:staging-workflows-first-green",
  "smoke:woo-shopify-live",
  "smoke:enterprise-sso-idp-staging",
  "smoke:p0-staging-proof-unblock",
  "ops:validate-p0-staging-proof-integrity",
  "check-vault-readiness",
] as const;

export const P0_STAGING_PROOF_EXECUTION_CI_SCRIPTS = [
  "test:ci:p0-staging-proof-execution",
  "test:ci:p0-staging-proof-execution:cert",
] as const;

export const P0_STAGING_PROOF_EXECUTION_UNIT_TESTS = [
  "tests/unit/p0-staging-proof-execution-orchestrator.test.ts",
  "tests/unit/p0-staging-proof-execution-cert-live.test.ts",
] as const;

export const P0_STAGING_PROOF_EXECUTION_CANONICAL_DOC_PATHS = [
  P0_STAGING_PROOF_EXECUTION_DOC,
  P0_STAGING_PROOF_EXECUTION_STEP3_DOC,
  "docs/ops-vault-matrix.md",
  "docs/era18-p0-staging-proof-ops-checklist.md",
] as const;

export const P0_STAGING_PROOF_EXECUTION_PRODUCT_SURFACES = [
  "lib/commercial/p0-ops-vault-ui-era21.ts",
  "components/dashboard/p0-ops-vault-phases-panel.tsx",
  "lib/integrations/integration-health-trust-layer-era20.ts",
] as const;

export {
  P0_STAGING_PROOF_EXECUTION_DOC,
  P0_STAGING_PROOF_EXECUTION_HTML_ARTIFACT,
  P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_COMMAND,
  P0_STAGING_PROOF_EXECUTION_STEP3_DOC,
  P0_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT,
};
