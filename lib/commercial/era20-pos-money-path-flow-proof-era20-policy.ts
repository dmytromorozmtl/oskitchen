/**
 * Era 20 — POS checkout → receipt → inventory depletion flow proof (Workstream G Cycle 12).
 */

import { ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID } from "@/lib/commercial/era20-operator-golden-path-proof-era20-policy";

export const ERA20_POS_MONEY_PATH_FLOW_PROOF_POLICY_ID =
  "era20-pos-money-path-flow-proof-v1" as const;

export const ERA20_POS_MONEY_PATH_FLOW_PROOF_BACKLOG_ID = "KOS-E20-012" as const;

export const ERA20_POS_MONEY_PATH_FLOW_PROOF_WORKFLOW_ID = "pos_to_inventory" as const;

export const ERA20_POS_MONEY_PATH_FLOW_PROOF_EXTENDS_POLICIES = [
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID,
] as const;

export const ERA20_POS_MONEY_PATH_FLOW_PROOF_DOC =
  "docs/era20-pos-money-path-flow-proof-2026-05-28.md" as const;

export const ERA20_POS_MONEY_PATH_FLOW_PROOF_HOP_IDS = [
  "shift_open",
  "terminal_checkout",
  "receipt_order_hub",
  "pos_only_inventory_depletion",
  "shift_closeout",
] as const;

export const ERA20_POS_MONEY_PATH_FLOW_PROOF_CI_SCRIPTS = [
  "test:ci:era20-pos-money-path-flow-proof",
  "test:ci:era20-pos-money-path-flow-proof:cert",
] as const;

export const ERA20_POS_MONEY_PATH_FLOW_PROOF_UNIT_TESTS = [
  "tests/unit/era20-pos-money-path-flow-proof.test.ts",
  "tests/unit/era20-pos-money-path-flow-proof-cert-live.test.ts",
] as const;
