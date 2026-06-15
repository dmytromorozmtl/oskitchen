/**
 * Era 20 — support session + impersonation flow proof for platform ops tabletop.
 */

import {
  ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_HOP_IDS,
  ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_POLICY_ID,
  ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_WORKFLOW_ID,
} from "@/lib/commercial/era20-support-impersonation-flow-proof-era20-policy";
import { getEra20OperatorWorkflowProof } from "@/lib/commercial/era20-operator-golden-path-proof-era20";
import { PLATFORM_GO_LIVE_PROJECTS_ANCHOR } from "@/lib/go-live/platform-go-live-focus-era18-policy";

export type SupportImpersonationFlowHopId =
  (typeof ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_HOP_IDS)[number];

export type SupportImpersonationFlowHopProofState =
  | "real_ci"
  | "staging_manual"
  | "rbac_blocked"
  | "pilot_internal_only";

export type SupportImpersonationFlowHop = {
  id: SupportImpersonationFlowHopId;
  order: number;
  label: string;
  uiHref: string;
  servicePath: string;
  dataPath: string;
  rbac: string;
  tests: readonly string[];
  proofState: SupportImpersonationFlowHopProofState;
  blocker: string | null;
  nextAction: string;
};

export type SupportImpersonationFlowProofSlice = {
  policyId: typeof ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_POLICY_ID;
  workflowId: typeof ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_WORKFLOW_ID;
  headline: string;
  tier2PhaseId: string;
  hops: readonly SupportImpersonationFlowHop[];
  ciBackedHopCount: number;
  stagingManualHopCount: number;
  rbacBlockedHopCount: number;
  pilotInternalOnlyHopCount: number;
  parentWorkflowBlocker: string;
  parentWorkflowNextAction: string;
};

const GO_LIVE_PROJECTS_HREF = `/platform/go-live${PLATFORM_GO_LIVE_PROJECTS_ANCHOR}`;

const HOP_DEFINITIONS: readonly Omit<SupportImpersonationFlowHop, "proofState" | "blocker">[] = [
  {
    id: "support_queue_triage",
    order: 1,
    label: "Support queue triage",
    uiHref: "/platform/support/queue",
    servicePath: "services/platform/platform-support-service.ts",
    dataPath: "Ticket queue scoped to platform roles — not tenant self-serve",
    rbac: "platform:support:read",
    tests: ["tests/unit/platform-support-inbox-focus-era18.test.ts"],
    nextAction: "Open queue; pick tenant with active pilot or implementation",
  },
  {
    id: "support_session_start",
    order: 2,
    label: "Audited support session",
    uiHref: "/platform/workspaces",
    servicePath: "services/platform/platform-support-session-service.ts",
    dataPath: "PlatformSupportSession cookie + workspace binding",
    rbac: "platform:support-session:start",
    tests: [
      "tests/unit/platform-workspace-go-live-focus-era18.test.ts",
      "tests/unit/platform-go-live-support-deep-link-era18.test.ts",
    ],
    nextAction: "Start support session on target workspace before impersonation",
  },
  {
    id: "tenant_go_live_review",
    order: 3,
    label: "Tenant go-live review",
    uiHref: GO_LIVE_PROJECTS_HREF,
    servicePath: "lib/go-live/platform-go-live-focus-era18.ts",
    dataPath: "Deep link to /dashboard/go-live/projects/{id} after impersonate",
    rbac: "platform:workspaces:read + active session",
    tests: ["tests/unit/platform-go-live-support-deep-link-era18.test.ts"],
    nextAction: "Review tenant launch checklist under impersonation banner",
  },
  {
    id: "impersonation_mfa_gate",
    order: 4,
    label: "Impersonation (MFA + super-admin)",
    uiHref: GO_LIVE_PROJECTS_HREF,
    servicePath: "actions/platform-impersonation.ts",
    dataPath: "kos_imp_session TTL + block super-admin targets",
    rbac: "SUPER_ADMIN role row + MFA — no founder-email bypass",
    tests: [
      "tests/unit/platform-impersonation-audit.test.ts",
      "tests/unit/impersonation-session.test.ts",
    ],
    nextAction: "Complete MFA; confirm impersonation banner and auto-expire",
  },
  {
    id: "audit_trail_review",
    order: 5,
    label: "Audit trail review",
    uiHref: "/platform/audit",
    servicePath: "services/platform/platform-audit-service.ts",
    dataPath: "recordPlatformAudit on session start/end + impersonation",
    rbac: "platform:audit:read",
    tests: ["tests/unit/platform-impersonation-audit.test.ts"],
    nextAction: "Export audit slice; verify impersonation reason + workspace id",
  },
];

function resolveHopProofState(
  hopId: SupportImpersonationFlowHopId,
  input: { viewerCanImpersonate: boolean; hasActiveSupportSession: boolean },
): { proofState: SupportImpersonationFlowHopProofState; blocker: string | null } {
  if (hopId === "support_queue_triage") {
    return {
      proofState: "pilot_internal_only",
      blocker:
        "internal_only — customer pilots do not include platform support unless contract SLA says so",
    };
  }
  if (hopId === "impersonation_mfa_gate" && !input.viewerCanImpersonate) {
    return {
      proofState: "rbac_blocked",
      blocker: "Current actor cannot impersonate — requires SUPER_ADMIN + MFA setup",
    };
  }
  if (
    (hopId === "support_session_start" || hopId === "tenant_go_live_review") &&
    !input.hasActiveSupportSession
  ) {
    return {
      proofState: "staging_manual",
      blocker: "No active support session — start session on workspace before impersonation",
    };
  }
  if (
    hopId === "support_session_start" ||
    hopId === "impersonation_mfa_gate" ||
    hopId === "tenant_go_live_review"
  ) {
    return { proofState: "real_ci", blocker: null };
  }
  return { proofState: "staging_manual", blocker: null };
}

export function buildSupportImpersonationFlowHops(input: {
  viewerCanImpersonate: boolean;
  hasActiveSupportSession: boolean;
}): SupportImpersonationFlowHop[] {
  return HOP_DEFINITIONS.map((hop) => {
    const { proofState, blocker } = resolveHopProofState(hop.id, input);
    return { ...hop, proofState, blocker };
  });
}

export function buildSupportImpersonationFlowProofSlice(input: {
  viewerCanImpersonate: boolean;
  hasActiveSupportSession: boolean;
}): SupportImpersonationFlowProofSlice {
  const hops = buildSupportImpersonationFlowHops(input);
  const parent = getEra20OperatorWorkflowProof(
    ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_WORKFLOW_ID,
  );
  const ciBackedHopCount = hops.filter((h) => h.proofState === "real_ci").length;
  const stagingManualHopCount = hops.filter((h) => h.proofState === "staging_manual").length;
  const rbacBlockedHopCount = hops.filter((h) => h.proofState === "rbac_blocked").length;
  const pilotInternalOnlyHopCount = hops.filter(
    (h) => h.proofState === "pilot_internal_only",
  ).length;

  let headline =
    "Platform support impersonation proof — session-bound workspace, MFA gate, audited trail; no founder bypass.";
  if (rbacBlockedHopCount > 0) {
    headline =
      "Viewer cannot impersonate — use super-admin with MFA for Week 2 tabletop drill.";
  } else if (!input.hasActiveSupportSession) {
    headline =
      "Start audited support session on target workspace before impersonation spot-check.";
  }

  return {
    policyId: ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_POLICY_ID,
    workflowId: ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_WORKFLOW_ID,
    headline,
    tier2PhaseId: "platform_support",
    hops,
    ciBackedHopCount,
    stagingManualHopCount,
    rbacBlockedHopCount,
    pilotInternalOnlyHopCount,
    parentWorkflowBlocker:
      parent?.blocker ?? "Pilot support boundaries doc required before kickoff",
    parentWorkflowNextAction:
      parent?.nextAction ?? "Tabletop support + impersonation drill Week 2",
  };
}
