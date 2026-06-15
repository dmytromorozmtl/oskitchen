/**
 * Era 20 — granular hop proof for storefront fulfillment → packing (Workstream G).
 */

import {
  ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_HOP_IDS,
  ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_POLICY_ID,
  ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_WORKFLOW_ID,
} from "@/lib/commercial/era20-storefront-fulfillment-flow-proof-era20-policy";
import { getEra20OperatorWorkflowProof } from "@/lib/commercial/era20-operator-golden-path-proof-era20";

export type StorefrontFulfillmentFlowHopId =
  (typeof ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_HOP_IDS)[number];

export type StorefrontFulfillmentFlowHopProofState =
  | "real_ci"
  | "staging_manual"
  | "blocked_p0";

export type StorefrontFulfillmentFlowHop = {
  id: StorefrontFulfillmentFlowHopId;
  order: number;
  label: string;
  uiHref: string;
  servicePath: string;
  dataPath: string;
  rbac: string;
  tests: readonly string[];
  proofState: StorefrontFulfillmentFlowHopProofState;
  blocker: string | null;
  nextAction: string;
};

export type StorefrontFulfillmentFlowProofSlice = {
  policyId: typeof ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_POLICY_ID;
  workflowId: typeof ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_WORKFLOW_ID;
  headline: string;
  tier2PhaseId: string;
  hops: readonly StorefrontFulfillmentFlowHop[];
  ciBackedHopCount: number;
  stagingManualHopCount: number;
  blockedHopCount: number;
  parentWorkflowBlocker: string;
  parentWorkflowNextAction: string;
};

const HOP_DEFINITIONS: readonly Omit<
  StorefrontFulfillmentFlowHop,
  "proofState" | "blocker"
>[] = [
  {
    id: "storefront_publish",
    order: 1,
    label: "Storefront published",
    uiHref: "/dashboard/storefront",
    servicePath: "services/storefront/storefront-settings-service.ts",
    dataPath: "StorefrontSettings.published + storefront checkout → Order",
    rbac: "storefront.manage / workspace owner",
    tests: ["test:ci:storefront-money-path:cert"],
    nextAction: "Publish storefront; place test order on staging",
  },
  {
    id: "order_ingest",
    order: 2,
    label: "Order ingested",
    uiHref: "/dashboard/order-hub?tab=all",
    servicePath:
      "services/storefront/storefront-stripe-checkout-service.ts · channel webhooks",
    dataPath: "Order + OrderLineItem workspace-scoped; external tab for Woo/Shopify",
    rbac: "orders.manage for hub; webhooks tenant-scoped",
    tests: ["tests/unit/order-hub-stuck-state-era18.test.ts"],
    nextAction: "Confirm order appears in Order hub within 60s",
  },
  {
    id: "order_hub_triage",
    order: 3,
    label: "Order hub triage",
    uiHref: "/dashboard/order-hub",
    servicePath: "services/order-hub/order-hub-service.ts",
    dataPath: "Tab counts + stuck-state next actions per row",
    rbac: "orders.manage",
    tests: [
      "tests/unit/order-hub-stuck-state-era18.test.ts",
      "tests/unit/order-hub-exact-counts-era18.test.ts",
    ],
    nextAction: "Clear stuck/mapping tabs; route to kitchen or packing",
  },
  {
    id: "kds_bump",
    order: 4,
    label: "KDS bump / recall",
    uiHref: "/dashboard/kitchen",
    servicePath: "services/kitchen-screen/kitchen-screen-service.ts",
    dataPath: "Kitchen ticket state transitions; UsageEvent kitchen activity",
    rbac: "kitchen.view · kitchen.bump",
    tests: ["tests/unit/kds-priority-lane-era19.test.ts", "test:ci:kds-smoke:cert"],
    nextAction: "Bump ticket on staging; verify order status advances",
  },
  {
    id: "packing_verify",
    order: 5,
    label: "Packing verification",
    uiHref: "/dashboard/packing#packing-qc-clarity",
    servicePath: "services/packing/packing-service.ts",
    dataPath: "Packing session + QC labels; order fulfillment complete",
    rbac: "packing.manage",
    tests: ["tests/unit/packing-qc-clarity-era19.test.ts"],
    nextAction: "Complete pack verify scan; confirm hub shows fulfilled",
  },
];

function resolveHopProofState(
  hopId: StorefrontFulfillmentFlowHopId,
  input: { p0ChannelProofPassed: boolean },
): { proofState: StorefrontFulfillmentFlowHopProofState; blocker: string | null } {
  if (hopId === "order_ingest" && !input.p0ChannelProofPassed) {
    return {
      proofState: "blocked_p0",
      blocker:
        "Woo/Shopify live smoke SKIPPED — channel ingest proof blocked until P0 #3 PASS",
    };
  }
  if (hopId === "storefront_publish" || hopId === "order_hub_triage" || hopId === "kds_bump") {
    return { proofState: hopId === "kds_bump" ? "staging_manual" : "real_ci", blocker: null };
  }
  if (hopId === "packing_verify") {
    return { proofState: "staging_manual", blocker: null };
  }
  return { proofState: "real_ci", blocker: null };
}

export function buildStorefrontFulfillmentFlowHops(input: {
  p0ChannelProofPassed: boolean;
}): StorefrontFulfillmentFlowHop[] {
  return HOP_DEFINITIONS.map((hop) => {
    const { proofState, blocker } = resolveHopProofState(hop.id, input);
    return { ...hop, proofState, blocker };
  });
}

export function buildStorefrontFulfillmentFlowProofSlice(input: {
  p0ChannelProofPassed: boolean;
}): StorefrontFulfillmentFlowProofSlice {
  const hops = buildStorefrontFulfillmentFlowHops(input);
  const parent = getEra20OperatorWorkflowProof(ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_WORKFLOW_ID);
  const ciBackedHopCount = hops.filter((h) => h.proofState === "real_ci").length;
  const stagingManualHopCount = hops.filter((h) => h.proofState === "staging_manual").length;
  const blockedHopCount = hops.filter((h) => h.proofState === "blocked_p0").length;

  let headline =
    "Five-hop fulfillment proof — storefront checkout through packing QC on real workspace data.";
  if (blockedHopCount > 0) {
    headline = `${blockedHopCount} hop(s) blocked by P0 channel proof — internal storefront path still testable on staging.`;
  }

  return {
    policyId: ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_POLICY_ID,
    workflowId: ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_WORKFLOW_ID,
    headline,
    tier2PhaseId: parent?.goldenPathPhaseId ?? "orders",
    hops,
    ciBackedHopCount,
    stagingManualHopCount,
    blockedHopCount,
    parentWorkflowBlocker: parent?.blocker ?? "Workflow map missing",
    parentWorkflowNextAction: parent?.nextAction ?? "Run Tier 2 orders phase on staging",
  };
}

export function resolveP0ChannelProofPassed(
  p0ProofStatus: string | null | undefined,
  channelChildProofStatus: string | null | undefined,
): boolean {
  if (p0ProofStatus !== "proof_passed") return false;
  if (!channelChildProofStatus) return false;
  return (
    channelChildProofStatus === "proof_passed" ||
    (channelChildProofStatus.includes("proof_passed") &&
      !channelChildProofStatus.includes("proof_skipped"))
  );
}
