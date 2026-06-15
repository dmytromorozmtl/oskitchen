/**
 * Era 20 — Support impersonation → audit flow proof (Workstream G Cycle 14).
 */

import { ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID } from "@/lib/commercial/era20-operator-golden-path-proof-era20-policy";

export const ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_POLICY_ID =
  "era20-support-impersonation-flow-proof-v1" as const;

export const ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_BACKLOG_ID = "KOS-E20-014" as const;

export const ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_WORKFLOW_ID =
  "support_impersonation_audit" as const;

export const ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_HOP_IDS = [
  "support_queue_triage",
  "support_session_start",
  "tenant_go_live_review",
  "impersonation_mfa_gate",
  "audit_trail_review",
] as const;

export const ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_CI_SCRIPTS = [
  "test:ci:era20-support-impersonation-flow-proof",
  "test:ci:era20-support-impersonation-flow-proof:cert",
] as const;

export const ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_UNIT_TESTS = [
  "tests/unit/era20-support-impersonation-flow-proof.test.ts",
  "tests/unit/era20-support-impersonation-flow-proof-cert-live.test.ts",
] as const;

export const ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_DOC =
  "docs/era20-support-impersonation-flow-proof-2026-05-28.md" as const;

export const ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_EXTENDS_POLICIES = [
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID,
] as const;
