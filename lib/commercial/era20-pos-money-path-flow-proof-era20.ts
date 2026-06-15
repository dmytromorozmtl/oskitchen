/**
 * Era 20 — granular hop proof for POS checkout → receipt → POS-only inventory depletion.
 */

import {
  ERA20_POS_MONEY_PATH_FLOW_PROOF_HOP_IDS,
  ERA20_POS_MONEY_PATH_FLOW_PROOF_POLICY_ID,
  ERA20_POS_MONEY_PATH_FLOW_PROOF_WORKFLOW_ID,
} from "@/lib/commercial/era20-pos-money-path-flow-proof-era20-policy";
import { getEra20OperatorWorkflowProof } from "@/lib/commercial/era20-operator-golden-path-proof-era20";

export type PosMoneyPathFlowHopId = (typeof ERA20_POS_MONEY_PATH_FLOW_PROOF_HOP_IDS)[number];

export type PosMoneyPathFlowHopProofState = "real_ci" | "staging_manual" | "pilot_scope_locked";

export type PosMoneyPathFlowHop = {
  id: PosMoneyPathFlowHopId;
  order: number;
  label: string;
  uiHref: string;
  servicePath: string;
  dataPath: string;
  rbac: string;
  tests: readonly string[];
  proofState: PosMoneyPathFlowHopProofState;
  blocker: string | null;
  nextAction: string;
};

export type PosMoneyPathFlowProofSlice = {
  policyId: typeof ERA20_POS_MONEY_PATH_FLOW_PROOF_POLICY_ID;
  workflowId: typeof ERA20_POS_MONEY_PATH_FLOW_PROOF_WORKFLOW_ID;
  headline: string;
  tier2PhaseId: string;
  hops: readonly PosMoneyPathFlowHop[];
  ciBackedHopCount: number;
  stagingManualHopCount: number;
  pilotScopeLockedHopCount: number;
  parentWorkflowBlocker: string;
  parentWorkflowNextAction: string;
};

const HOP_DEFINITIONS: readonly Omit<PosMoneyPathFlowHop, "proofState" | "blocker">[] = [
  {
    id: "shift_open",
    order: 1,
    label: "Shift open",
    uiHref: "/dashboard/pos/shifts",
    servicePath: "services/pos/pos-shift-service.ts",
    dataPath: "POSShift.openedAt + register binding",
    rbac: "pos.shift.open",
    tests: ["tests/unit/pos-shift-close-clarity-era19.test.ts"],
    nextAction: "Open shift on staging before first sale",
  },
  {
    id: "terminal_checkout",
    order: 2,
    label: "POS checkout completes",
    uiHref: "/dashboard/pos/terminal",
    servicePath: "services/pos/pos-checkout-service.ts",
    dataPath: "POSTransaction + Order creationSource POS",
    rbac: "pos.checkout",
    tests: ["test:ci:pos-money-path:cert"],
    nextAction: "Run tier-2b cash checkout on staging",
  },
  {
    id: "receipt_order_hub",
    order: 3,
    label: "Receipt + Order hub trace",
    uiHref: "/dashboard/order-hub?tab=pos",
    servicePath: "services/order-hub/order-hub-service.ts",
    dataPath: "Order hub POS tab + receipt audit trail",
    rbac: "orders.manage",
    tests: ["tests/unit/order-hub-stuck-state-era18.test.ts"],
    nextAction: "Confirm POS order visible in hub within 30s",
  },
  {
    id: "pos_only_inventory_depletion",
    order: 4,
    label: "POS-only inventory depletion",
    uiHref: "/dashboard/inventory/pos-impacts",
    servicePath: "lib/inventory/inventory-depletion-policy.ts",
    dataPath:
      "InventoryImpactEvent from POS sale only — unified storefront/API depletion deferred_locked",
    rbac: "pos.checkout triggers depletion; production.manage for counts",
    tests: [
      "test:ci:inventory-depletion:cert",
      "test:ci:pos-only-inventory-lock-era17:cert",
    ],
    nextAction: "Verify recipe depletion row — never claim unified inventory",
  },
  {
    id: "shift_closeout",
    order: 5,
    label: "Shift closeout",
    uiHref: "/dashboard/pos/shifts",
    servicePath: "services/pos/pos-shift-service.ts",
    dataPath: "Closeout variance + cash reconciliation",
    rbac: "pos.shift.close",
    tests: [
      "tests/unit/pos-shift-close-focus-era18.test.ts",
      "tests/unit/pos-shift-close-clarity-era19.test.ts",
    ],
    nextAction: "Close shift with documented variance ack",
  },
];

function resolveHopProofState(hopId: PosMoneyPathFlowHopId): {
  proofState: PosMoneyPathFlowHopProofState;
  blocker: string | null;
} {
  if (hopId === "pos_only_inventory_depletion") {
    return {
      proofState: "pilot_scope_locked",
      blocker:
        "Pilot scope: POS-only depletion — do not promise unified inventory or storefront auto-depletion",
    };
  }
  if (hopId === "shift_open" || hopId === "shift_closeout") {
    return { proofState: "staging_manual", blocker: null };
  }
  return { proofState: "real_ci", blocker: null };
}

export function buildPosMoneyPathFlowHops(): PosMoneyPathFlowHop[] {
  return HOP_DEFINITIONS.map((hop) => {
    const { proofState, blocker } = resolveHopProofState(hop.id);
    return { ...hop, proofState, blocker };
  });
}

export function buildPosMoneyPathFlowProofSlice(): PosMoneyPathFlowProofSlice {
  const hops = buildPosMoneyPathFlowHops();
  const parent = getEra20OperatorWorkflowProof(ERA20_POS_MONEY_PATH_FLOW_PROOF_WORKFLOW_ID);
  const ciBackedHopCount = hops.filter((h) => h.proofState === "real_ci").length;
  const stagingManualHopCount = hops.filter((h) => h.proofState === "staging_manual").length;
  const pilotScopeLockedHopCount = hops.filter((h) => h.proofState === "pilot_scope_locked").length;

  const headline =
    "Five-hop POS money path — shift open through POS-only inventory depletion and closeout (CI-backed checkout).";

  return {
    policyId: ERA20_POS_MONEY_PATH_FLOW_PROOF_POLICY_ID,
    workflowId: ERA20_POS_MONEY_PATH_FLOW_PROOF_WORKFLOW_ID,
    headline,
    tier2PhaseId: parent?.goldenPathPhaseId ?? "pos",
    hops,
    ciBackedHopCount,
    stagingManualHopCount,
    pilotScopeLockedHopCount,
    parentWorkflowBlocker: parent?.blocker ?? "Workflow map missing",
    parentWorkflowNextAction: parent?.nextAction ?? "Tier 2 phase 5 on staging",
  };
}
