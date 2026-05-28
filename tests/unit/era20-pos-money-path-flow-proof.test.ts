import { describe, expect, it } from "vitest";

import {
  buildPosMoneyPathFlowHops,
  buildPosMoneyPathFlowProofSlice,
} from "@/lib/commercial/era20-pos-money-path-flow-proof-era20";
import { ERA20_POS_MONEY_PATH_FLOW_PROOF_POLICY_ID } from "@/lib/commercial/era20-pos-money-path-flow-proof-era20-policy";

describe("era20-pos-money-path-flow-proof", () => {
  it("locks era20 POS money path flow proof policy id", () => {
    expect(ERA20_POS_MONEY_PATH_FLOW_PROOF_POLICY_ID).toBe(
      "era20-pos-money-path-flow-proof-v1",
    );
  });

  it("builds five hops in order", () => {
    const hops = buildPosMoneyPathFlowHops();
    expect(hops).toHaveLength(5);
    expect(hops.map((h) => h.id)).toEqual([
      "shift_open",
      "terminal_checkout",
      "receipt_order_hub",
      "pos_only_inventory_depletion",
      "shift_closeout",
    ]);
  });

  it("marks inventory hop as pilot scope locked not unified inventory", () => {
    const hop = buildPosMoneyPathFlowHops().find((h) => h.id === "pos_only_inventory_depletion");
    expect(hop?.proofState).toBe("pilot_scope_locked");
    expect(hop?.blocker).toContain("POS-only");
    expect(hop?.blocker).toContain("unified inventory");
  });

  it("links parent pos_to_inventory workflow", () => {
    const slice = buildPosMoneyPathFlowProofSlice();
    expect(slice.workflowId).toBe("pos_to_inventory");
    expect(slice.ciBackedHopCount).toBeGreaterThanOrEqual(2);
    expect(slice.tier2PhaseId).toBe("pos");
  });
});
