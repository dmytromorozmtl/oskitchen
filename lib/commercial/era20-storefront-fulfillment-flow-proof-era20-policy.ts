/**
 * Era 20 — Storefront → Order Hub → KDS → Packing flow proof (Workstream G Cycle 11).
 */

import { ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID } from "@/lib/commercial/era20-operator-golden-path-proof-era20-policy";

export const ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_POLICY_ID =
  "era20-storefront-fulfillment-flow-proof-v1" as const;

export const ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_BACKLOG_ID = "KOS-E20-011" as const;

export const ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_WORKFLOW_ID = "storefront_to_packing" as const;

export const ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_EXTENDS_POLICIES = [
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID,
] as const;

export const ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_DOC =
  "docs/era20-storefront-fulfillment-flow-proof-2026-05-28.md" as const;

export const ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_HOP_IDS = [
  "storefront_publish",
  "order_ingest",
  "order_hub_triage",
  "kds_bump",
  "packing_verify",
] as const;

export const ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_CI_SCRIPTS = [
  "test:ci:era20-storefront-fulfillment-flow-proof",
  "test:ci:era20-storefront-fulfillment-flow-proof:cert",
] as const;

export const ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_UNIT_TESTS = [
  "tests/unit/era20-storefront-fulfillment-flow-proof.test.ts",
  "tests/unit/era20-storefront-fulfillment-flow-proof-cert-live.test.ts",
] as const;
