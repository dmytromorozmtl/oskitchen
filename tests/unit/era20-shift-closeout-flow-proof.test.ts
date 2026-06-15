import { describe, expect, it } from "vitest";

import {
  buildShiftCloseoutFlowHops,
  buildShiftCloseoutFlowProofSlice,
} from "@/lib/commercial/era20-shift-closeout-flow-proof-era20";
import { ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_POLICY_ID } from "@/lib/commercial/era20-shift-closeout-flow-proof-era20-policy";

describe("era20-shift-closeout-flow-proof", () => {
  it("locks era20 shift closeout flow proof policy id", () => {
    expect(ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_POLICY_ID).toBe(
      "era20-shift-closeout-flow-proof-v1",
    );
  });

  it("builds five hops in order", () => {
    const hops = buildShiftCloseoutFlowHops({
      viewerCanOpenShift: true,
      viewerCanCloseShift: true,
      hasOpenShift: true,
    });
    expect(hops).toHaveLength(5);
    expect(hops.map((h) => h.id)).toEqual([
      "shift_open",
      "terminal_sales",
      "closeout_checklist",
      "variance_ack",
      "closeout_history",
    ]);
  });

  it("blocks closeout hops when viewer cannot close shift", () => {
    const hop = buildShiftCloseoutFlowHops({
      viewerCanOpenShift: true,
      viewerCanCloseShift: false,
      hasOpenShift: true,
    }).find((h) => h.id === "closeout_checklist");
    expect(hop?.proofState).toBe("rbac_blocked");
  });

  it("requires open shift before closeout checklist is CI-backed path", () => {
    const hop = buildShiftCloseoutFlowHops({
      viewerCanOpenShift: true,
      viewerCanCloseShift: true,
      hasOpenShift: false,
    }).find((h) => h.id === "closeout_checklist");
    expect(hop?.proofState).toBe("staging_manual");
    expect(hop?.blocker).toContain("open shift");
  });

  it("links parent shift_closeout workflow", () => {
    const slice = buildShiftCloseoutFlowProofSlice({
      viewerCanOpenShift: true,
      viewerCanCloseShift: true,
      hasOpenShift: true,
    });
    expect(slice.workflowId).toBe("shift_closeout");
    expect(slice.tier2PhaseId).toBe("pos");
    expect(slice.ciBackedHopCount).toBeGreaterThanOrEqual(2);
  });
});
