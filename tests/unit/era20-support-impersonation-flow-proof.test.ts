import { describe, expect, it } from "vitest";

import {
  buildSupportImpersonationFlowHops,
  buildSupportImpersonationFlowProofSlice,
} from "@/lib/commercial/era20-support-impersonation-flow-proof-era20";
import { ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_POLICY_ID } from "@/lib/commercial/era20-support-impersonation-flow-proof-era20-policy";

describe("era20-support-impersonation-flow-proof", () => {
  it("locks era20 support impersonation flow proof policy id", () => {
    expect(ERA20_SUPPORT_IMPERSONATION_FLOW_PROOF_POLICY_ID).toBe(
      "era20-support-impersonation-flow-proof-v1",
    );
  });

  it("builds five hops in order", () => {
    const hops = buildSupportImpersonationFlowHops({
      viewerCanImpersonate: true,
      hasActiveSupportSession: true,
    });
    expect(hops).toHaveLength(5);
    expect(hops.map((h) => h.id)).toEqual([
      "support_queue_triage",
      "support_session_start",
      "tenant_go_live_review",
      "impersonation_mfa_gate",
      "audit_trail_review",
    ]);
  });

  it("marks queue hop as pilot internal only", () => {
    const hop = buildSupportImpersonationFlowHops({
      viewerCanImpersonate: true,
      hasActiveSupportSession: true,
    }).find((h) => h.id === "support_queue_triage");
    expect(hop?.proofState).toBe("pilot_internal_only");
    expect(hop?.blocker).toContain("internal_only");
  });

  it("marks impersonation hop rbac blocked for non-super-admin viewer", () => {
    const hop = buildSupportImpersonationFlowHops({
      viewerCanImpersonate: false,
      hasActiveSupportSession: true,
    }).find((h) => h.id === "impersonation_mfa_gate");
    expect(hop?.proofState).toBe("rbac_blocked");
  });

  it("requires support session before go-live review hop is CI-backed", () => {
    const withoutSession = buildSupportImpersonationFlowHops({
      viewerCanImpersonate: true,
      hasActiveSupportSession: false,
    }).find((h) => h.id === "tenant_go_live_review");
    expect(withoutSession?.proofState).toBe("staging_manual");
    expect(withoutSession?.blocker).toContain("support session");
  });

  it("links parent support_impersonation_audit workflow", () => {
    const slice = buildSupportImpersonationFlowProofSlice({
      viewerCanImpersonate: true,
      hasActiveSupportSession: true,
    });
    expect(slice.workflowId).toBe("support_impersonation_audit");
    expect(slice.ciBackedHopCount).toBeGreaterThanOrEqual(2);
    expect(slice.tier2PhaseId).toBe("platform_support");
  });
});
