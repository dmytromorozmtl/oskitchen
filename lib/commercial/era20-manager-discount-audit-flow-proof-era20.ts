/**
 * Era 20 — manager discount / comp override flow proof for Tier 2 spot-check.
 */

import {
  ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_HOP_IDS,
  ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_POLICY_ID,
  ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_WORKFLOW_ID,
} from "@/lib/commercial/era20-manager-discount-audit-flow-proof-era20-policy";
import { getEra20OperatorWorkflowProof } from "@/lib/commercial/era20-operator-golden-path-proof-era20";

export type ManagerDiscountAuditFlowHopId =
  (typeof ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_HOP_IDS)[number];

export type ManagerDiscountAuditFlowHopProofState =
  | "real_ci"
  | "staging_manual"
  | "rbac_blocked";

export type ManagerDiscountAuditFlowHop = {
  id: ManagerDiscountAuditFlowHopId;
  order: number;
  label: string;
  uiHref: string;
  servicePath: string;
  dataPath: string;
  rbac: string;
  tests: readonly string[];
  proofState: ManagerDiscountAuditFlowHopProofState;
  blocker: string | null;
  nextAction: string;
};

export type ManagerDiscountAuditFlowProofSlice = {
  policyId: typeof ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_POLICY_ID;
  workflowId: typeof ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_WORKFLOW_ID;
  headline: string;
  tier2PhaseId: string;
  hops: readonly ManagerDiscountAuditFlowHop[];
  ciBackedHopCount: number;
  stagingManualHopCount: number;
  rbacBlockedHopCount: number;
  parentWorkflowBlocker: string;
  parentWorkflowNextAction: string;
};

const HOP_DEFINITIONS: readonly Omit<ManagerDiscountAuditFlowHop, "proofState" | "blocker">[] =
  [
    {
      id: "shift_open",
      order: 1,
      label: "Shift open on register",
      uiHref: "/dashboard/pos/shifts",
      servicePath: "services/pos/pos-shift-service.ts",
      dataPath: "Override checklist blocked until active shift",
      rbac: "pos.shift.open",
      tests: ["tests/unit/pos-shift-close-clarity-era19.test.ts"],
      nextAction: "Open shift before manager override spot-check",
    },
    {
      id: "manager_permission",
      order: 2,
      label: "Manager discount permission",
      uiHref: "/dashboard/pos/terminal#pos-manager-override",
      servicePath: "lib/permissions/guards.ts",
      dataPath: "pos.discount.apply — denial audited on mutate",
      rbac: "pos.discount.apply",
      tests: [
        "tests/unit/pos-manager-discount-era17-policy.test.ts",
        "tests/unit/pos-discount-guard.test.ts",
      ],
      nextAction: "Sign in as manager with pos.discount.apply",
    },
    {
      id: "override_checklist",
      order: 3,
      label: "Override checklist (4 steps)",
      uiHref: "/dashboard/pos/terminal#pos-manager-override",
      servicePath: "lib/pos/pos-manager-override-clarity-era19.ts",
      dataPath: "Permission → type → value → review — no Toast PIN parity",
      rbac: "pos.discount.apply",
      tests: ["tests/unit/pos-manager-override-clarity-era19.test.ts"],
      nextAction: "Walk checklist on staging with comp or percent discount",
    },
    {
      id: "discount_applied",
      order: 4,
      label: "Discount on completed sale",
      uiHref: "/dashboard/pos/terminal",
      servicePath: "services/pos/pos-checkout-service.ts",
      dataPath: "POSTransaction.discount + Order totals reflect override",
      rbac: "pos.checkout + pos.discount.apply",
      tests: ["test:ci:pos-money-path:cert"],
      nextAction: "Complete sale; verify receipt shows discount line",
    },
    {
      id: "audit_trail",
      order: 5,
      label: "Audit trail recorded",
      uiHref: "/dashboard/reports",
      servicePath: "services/audit/",
      dataPath: "pos_comp / discount mutations emit audit events",
      rbac: "reports.read.audit for review",
      tests: ["tests/unit/audit-sensitive-detail-rbac.test.ts"],
      nextAction: "Confirm audit row for override in reports or audit export",
    },
  ];

function resolveHopProofState(
  hopId: ManagerDiscountAuditFlowHopId,
  input: { viewerCanApplyDiscount: boolean },
): { proofState: ManagerDiscountAuditFlowHopProofState; blocker: string | null } {
  if (hopId === "manager_permission" && !input.viewerCanApplyDiscount) {
    return {
      proofState: "rbac_blocked",
      blocker: "Current user lacks pos.discount.apply — use manager role on staging",
    };
  }
  if (hopId === "manager_permission" || hopId === "override_checklist") {
    return { proofState: "real_ci", blocker: null };
  }
  if (hopId === "discount_applied") {
    return {
      proofState: "staging_manual",
      blocker: null,
    };
  }
  return { proofState: "staging_manual", blocker: null };
}

export function buildManagerDiscountAuditFlowHops(input: {
  viewerCanApplyDiscount: boolean;
}): ManagerDiscountAuditFlowHop[] {
  return HOP_DEFINITIONS.map((hop) => {
    const { proofState, blocker } = resolveHopProofState(hop.id, input);
    return { ...hop, proofState, blocker };
  });
}

export function buildManagerDiscountAuditFlowProofSlice(input: {
  viewerCanApplyDiscount: boolean;
}): ManagerDiscountAuditFlowProofSlice {
  const hops = buildManagerDiscountAuditFlowHops(input);
  const parent = getEra20OperatorWorkflowProof(
    ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_WORKFLOW_ID,
  );
  const ciBackedHopCount = hops.filter((h) => h.proofState === "real_ci").length;
  const stagingManualHopCount = hops.filter((h) => h.proofState === "staging_manual").length;
  const rbacBlockedHopCount = hops.filter((h) => h.proofState === "rbac_blocked").length;

  let headline =
    "Manager override proof — discount/comp with audit trail; no hardware PIN parity claims.";
  if (rbacBlockedHopCount > 0) {
    headline =
      "Viewer lacks pos.discount.apply — switch to manager on staging for override spot-check.";
  }

  return {
    policyId: ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_POLICY_ID,
    workflowId: ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_WORKFLOW_ID,
    headline,
    tier2PhaseId: parent?.goldenPathPhaseId ?? "pos",
    hops,
    ciBackedHopCount,
    stagingManualHopCount,
    rbacBlockedHopCount,
    parentWorkflowBlocker: parent?.blocker ?? "No Toast PIN parity claim",
    parentWorkflowNextAction: parent?.nextAction ?? "Spot-check override on staging",
  };
}
