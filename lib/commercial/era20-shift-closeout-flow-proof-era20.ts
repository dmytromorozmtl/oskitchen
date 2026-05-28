/**
 * Era 20 — shift open through closeout variance for Tier 2 POS phase spot-check.
 */

import {
  ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_HOP_IDS,
  ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_POLICY_ID,
  ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_WORKFLOW_ID,
} from "@/lib/commercial/era20-shift-closeout-flow-proof-era20-policy";
import { getEra20OperatorWorkflowProof } from "@/lib/commercial/era20-operator-golden-path-proof-era20";
import { POS_SHIFT_CLOSE_FORM_ANCHOR } from "@/lib/pos/pos-shift-close-clarity-era19-policy";

export type ShiftCloseoutFlowHopId = (typeof ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_HOP_IDS)[number];

export type ShiftCloseoutFlowHopProofState =
  | "real_ci"
  | "staging_manual"
  | "rbac_blocked";

export type ShiftCloseoutFlowHop = {
  id: ShiftCloseoutFlowHopId;
  order: number;
  label: string;
  uiHref: string;
  servicePath: string;
  dataPath: string;
  rbac: string;
  tests: readonly string[];
  proofState: ShiftCloseoutFlowHopProofState;
  blocker: string | null;
  nextAction: string;
};

export type ShiftCloseoutFlowProofSlice = {
  policyId: typeof ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_POLICY_ID;
  workflowId: typeof ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_WORKFLOW_ID;
  headline: string;
  tier2PhaseId: string;
  hops: readonly ShiftCloseoutFlowHop[];
  ciBackedHopCount: number;
  stagingManualHopCount: number;
  rbacBlockedHopCount: number;
  parentWorkflowBlocker: string;
  parentWorkflowNextAction: string;
};

const CLOSEOUT_HREF = `/dashboard/pos/shifts#${POS_SHIFT_CLOSE_FORM_ANCHOR}`;

const HOP_DEFINITIONS: readonly Omit<ShiftCloseoutFlowHop, "proofState" | "blocker">[] = [
  {
    id: "shift_open",
    order: 1,
    label: "Shift open on register",
    uiHref: "/dashboard/pos/shifts",
    servicePath: "services/pos/pos-shift-service.ts",
    dataPath: "POSShift.openedAt + opening cash + register binding",
    rbac: "pos.shift.open",
    tests: ["tests/unit/pos-shift-close-clarity-era19.test.ts"],
    nextAction: "Open shift before first sale on staging",
  },
  {
    id: "terminal_sales",
    order: 2,
    label: "Sales during open shift",
    uiHref: "/dashboard/pos/terminal",
    servicePath: "services/pos/pos-checkout-service.ts",
    dataPath: "POSTransaction rows while shift.status = OPEN",
    rbac: "pos.checkout",
    tests: ["test:ci:pos-money-path:cert"],
    nextAction: "Complete at least one cash sale on staging register",
  },
  {
    id: "closeout_checklist",
    order: 3,
    label: "Closeout checklist (4 steps)",
    uiHref: CLOSEOUT_HREF,
    servicePath: "lib/pos/pos-shift-close-clarity-era19.ts",
    dataPath: "Count drawer → review expected → variance note — no hardware parity",
    rbac: "pos.shift.close",
    tests: [
      "tests/unit/pos-shift-close-clarity-era19.test.ts",
      "tests/unit/pos-shift-close-focus-era18.test.ts",
    ],
    nextAction: "Walk checklist at #pos-shift-close with open shift",
  },
  {
    id: "variance_ack",
    order: 4,
    label: "Variance acknowledged",
    uiHref: CLOSEOUT_HREF,
    servicePath: "services/pos/pos-shift-service.ts",
    dataPath: "Closeout expected vs counted cash + variance reason",
    rbac: "pos.shift.close",
    tests: ["tests/unit/pos-shift-close-focus-era18.test.ts"],
    nextAction: "Close shift; document over/short with manager ack if needed",
  },
  {
    id: "closeout_history",
    order: 5,
    label: "Closeout history review",
    uiHref: "/dashboard/pos/shifts",
    servicePath: "services/pos/pos-shift-service.ts",
    dataPath: "Recent closeouts panel + CSV export when pos.shift.close",
    rbac: "pos.shift.open or pos.shift.close for history",
    tests: ["tests/unit/pos-shift-close-clarity-era19.test.ts"],
    nextAction: "Verify closed row appears in history within 30s",
  },
];

function resolveHopProofState(
  hopId: ShiftCloseoutFlowHopId,
  input: {
    viewerCanOpenShift: boolean;
    viewerCanCloseShift: boolean;
    hasOpenShift: boolean;
  },
): { proofState: ShiftCloseoutFlowHopProofState; blocker: string | null } {
  if (hopId === "shift_open" && !input.viewerCanOpenShift) {
    return {
      proofState: "rbac_blocked",
      blocker: "Current user lacks pos.shift.open — use cashier/manager on staging",
    };
  }
  if (
    (hopId === "closeout_checklist" || hopId === "variance_ack") &&
    !input.viewerCanCloseShift
  ) {
    return {
      proofState: "rbac_blocked",
      blocker: "Current user lacks pos.shift.close — manager role required for closeout",
    };
  }
  if (
    (hopId === "closeout_checklist" || hopId === "variance_ack") &&
    !input.hasOpenShift
  ) {
    return {
      proofState: "staging_manual",
      blocker: "No open shift — open register shift before closeout spot-check",
    };
  }
  if (hopId === "closeout_checklist" || hopId === "shift_open") {
    return { proofState: "real_ci", blocker: null };
  }
  return { proofState: "staging_manual", blocker: null };
}

export function buildShiftCloseoutFlowHops(input: {
  viewerCanOpenShift: boolean;
  viewerCanCloseShift: boolean;
  hasOpenShift: boolean;
}): ShiftCloseoutFlowHop[] {
  return HOP_DEFINITIONS.map((hop) => {
    const { proofState, blocker } = resolveHopProofState(hop.id, input);
    return { ...hop, proofState, blocker };
  });
}

export function buildShiftCloseoutFlowProofSlice(input: {
  viewerCanOpenShift: boolean;
  viewerCanCloseShift: boolean;
  hasOpenShift: boolean;
}): ShiftCloseoutFlowProofSlice {
  const hops = buildShiftCloseoutFlowHops(input);
  const parent = getEra20OperatorWorkflowProof(ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_WORKFLOW_ID);
  const ciBackedHopCount = hops.filter((h) => h.proofState === "real_ci").length;
  const stagingManualHopCount = hops.filter((h) => h.proofState === "staging_manual").length;
  const rbacBlockedHopCount = hops.filter((h) => h.proofState === "rbac_blocked").length;

  let headline =
    "Shift closeout proof — open register, sell on terminal, close with variance honesty; no hardware closeout claims.";
  if (rbacBlockedHopCount > 0) {
    headline =
      "Viewer lacks shift permissions — use cashier/manager with pos.shift.open and pos.shift.close on staging.";
  } else if (!input.hasOpenShift) {
    headline = "No open shift — open a register shift before Tier 2 closeout spot-check.";
  }

  return {
    policyId: ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_POLICY_ID,
    workflowId: ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_WORKFLOW_ID,
    headline,
    tier2PhaseId: parent?.goldenPathPhaseId ?? "pos",
    hops,
    ciBackedHopCount,
    stagingManualHopCount,
    rbacBlockedHopCount,
    parentWorkflowBlocker: parent?.blocker ?? "None for software path",
    parentWorkflowNextAction: parent?.nextAction ?? "Tier 2 phase 5 closeout on staging",
  };
}
