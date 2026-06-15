import { describe, expect, it } from "vitest";

import {
  buildStorefrontFulfillmentFlowProofSlice,
  buildStorefrontFulfillmentFlowHops,
  resolveP0ChannelProofPassed,
} from "@/lib/commercial/era20-storefront-fulfillment-flow-proof-era20";
import { ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_POLICY_ID } from "@/lib/commercial/era20-storefront-fulfillment-flow-proof-era20-policy";

describe("era20-storefront-fulfillment-flow-proof", () => {
  it("locks era20 fulfillment flow proof policy id", () => {
    expect(ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_POLICY_ID).toBe(
      "era20-storefront-fulfillment-flow-proof-v1",
    );
  });

  it("builds five hops in order", () => {
    const hops = buildStorefrontFulfillmentFlowHops({ p0ChannelProofPassed: false });
    expect(hops).toHaveLength(5);
    expect(hops.map((h) => h.id)).toEqual([
      "storefront_publish",
      "order_ingest",
      "order_hub_triage",
      "kds_bump",
      "packing_verify",
    ]);
  });

  it("blocks order ingest hop when P0 channel proof missing", () => {
    const hops = buildStorefrontFulfillmentFlowHops({ p0ChannelProofPassed: false });
    const ingest = hops.find((h) => h.id === "order_ingest");
    expect(ingest?.proofState).toBe("blocked_p0");
    expect(ingest?.blocker).toContain("P0");
  });

  it("clears channel ingest block when P0 channel passed", () => {
    expect(resolveP0ChannelProofPassed("proof_passed", "proof_passed")).toBe(true);
    const hops = buildStorefrontFulfillmentFlowHops({ p0ChannelProofPassed: true });
    expect(hops.find((h) => h.id === "order_ingest")?.proofState).not.toBe("blocked_p0");
  });

  it("links parent storefront_to_packing workflow", () => {
    const slice = buildStorefrontFulfillmentFlowProofSlice({ p0ChannelProofPassed: false });
    expect(slice.workflowId).toBe("storefront_to_packing");
    expect(slice.parentWorkflowBlocker).toContain("P0");
    expect(slice.blockedHopCount).toBe(1);
  });
});
