/**
 * Era 20 — Shift open → sales → closeout flow proof (Workstream G Cycle 16).
 */

import { ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID } from "@/lib/commercial/era20-operator-golden-path-proof-era20-policy";

export const ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_POLICY_ID =
  "era20-shift-closeout-flow-proof-v1" as const;

export const ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_BACKLOG_ID = "KOS-E20-016" as const;

export const ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_WORKFLOW_ID = "shift_closeout" as const;

export const ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_HOP_IDS = [
  "shift_open",
  "terminal_sales",
  "closeout_checklist",
  "variance_ack",
  "closeout_history",
] as const;

export const ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_CI_SCRIPTS = [
  "test:ci:era20-shift-closeout-flow-proof",
  "test:ci:era20-shift-closeout-flow-proof:cert",
] as const;

export const ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_UNIT_TESTS = [
  "tests/unit/era20-shift-closeout-flow-proof.test.ts",
  "tests/unit/era20-shift-closeout-flow-proof-cert-live.test.ts",
] as const;

export const ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_DOC =
  "docs/era20-shift-closeout-flow-proof-2026-05-28.md" as const;

export const ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_EXTENDS_POLICIES = [
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID,
  "era19-pos-shift-close-clarity-v1",
] as const;
