/**
 * Vault readiness policy — Era 29 ops vault readiness execution layer.
 * Extends era21-p0-ops-vault-v1 with check-vault-readiness + HTML report artifact.
 */

import { P0_OPS_VAULT_ERA21_POLICY_ID } from "@/lib/commercial/p0-ops-vault-era21-policy";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { VAULT_READINESS_REPORT_ARTIFACT } from "@/lib/ops/vault-readiness-report";

export const VAULT_READINESS_POLICY_ID = "era29-vault-readiness-v1" as const;

export const VAULT_READINESS_BACKLOG_ID = "KOS-E29-001-VAULT-READINESS" as const;

export { VAULT_READINESS_REPORT_ARTIFACT };

export const VAULT_READINESS_EXTENDS_POLICIES = [
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
  P0_OPS_VAULT_ERA21_POLICY_ID,
] as const;

export const VAULT_READINESS_NPM_SCRIPT = "check-vault-readiness" as const;

export const VAULT_READINESS_ORCHESTRATOR_SCRIPT =
  "scripts/check-vault-readiness.ts" as const;

export const VAULT_READINESS_HTML_ARTIFACT = "artifacts/vault-readiness-report.html" as const;

export const VAULT_READINESS_MATRIX_DOC = "docs/ops-vault-matrix.md" as const;

export const VAULT_READINESS_EMAIL_TEMPLATE_DOC = "docs/ops-email-template.md" as const;

export const VAULT_READINESS_OPS_SCRIPTS = [
  "check-vault-readiness",
  "ops:validate-p0-vault-env",
  "ops:run-p0-vault-day0-orchestrator",
  "smoke:p0-staging-proof-unblock",
] as const;

export const VAULT_READINESS_CI_SCRIPTS = [
  "test:ci:vault-readiness",
  "test:ci:vault-readiness:cert",
] as const;

export const VAULT_READINESS_UNIT_TESTS = [
  "tests/unit/vault-readiness-report.test.ts",
  "tests/unit/vault-readiness-cert-live.test.ts",
] as const;

export const VAULT_READINESS_CANONICAL_MARKERS = [
  VAULT_READINESS_POLICY_ID,
  VAULT_READINESS_REPORT_ARTIFACT,
  VAULT_READINESS_HTML_ARTIFACT,
  "vaultReady",
  "awaiting_ops_credentials",
  "PASS > SKIPPED",
] as const;

export const VAULT_READINESS_CANONICAL_DOC_PATHS = [
  VAULT_READINESS_MATRIX_DOC,
  VAULT_READINESS_EMAIL_TEMPLATE_DOC,
  "docs/era18-p0-staging-proof-ops-checklist.md",
  "docs/p0-ops-vault-execution-playbook-2026-05-28.md",
  "docs/final-execution-report.md",
] as const;

export const VAULT_READINESS_PRODUCT_SURFACES = [
  "components/dashboard/p0-ops-vault-phases-panel.tsx",
  "lib/commercial/p0-ops-vault-ui-era21.ts",
] as const;

export const VAULT_READINESS_GUARDRAILS = [
  "Never write proof_passed when child smokes are SKIPPED",
  "vault-readiness-report.json must reflect live env + committed P0 artifacts",
  "HTML report is human-readable only — JSON artifact is source of truth",
] as const;
