/**
 * Era 20 — Manager discount → audit flow proof (Workstream G Cycle 13).
 */

import { ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID } from "@/lib/commercial/era20-operator-golden-path-proof-era20-policy";

export const ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_POLICY_ID =
  "era20-manager-discount-audit-flow-proof-v1" as const;

export const ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_BACKLOG_ID = "KOS-E20-013" as const;

export const ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_WORKFLOW_ID = "manager_discount_audit" as const;

export const ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_HOP_IDS = [
  "shift_open",
  "manager_permission",
  "override_checklist",
  "discount_applied",
  "audit_trail",
] as const;

export const ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_CI_SCRIPTS = [
  "test:ci:era20-manager-discount-audit-flow-proof",
  "test:ci:era20-manager-discount-audit-flow-proof:cert",
] as const;

export const ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_UNIT_TESTS = [
  "tests/unit/era20-manager-discount-audit-flow-proof.test.ts",
  "tests/unit/era20-manager-discount-audit-flow-proof-cert-live.test.ts",
] as const;

export const ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_DOC =
  "docs/era20-manager-discount-audit-flow-proof-2026-05-28.md" as const;
