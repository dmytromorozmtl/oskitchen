import { describe, expect, it } from "vitest";

import {
  ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_BACKLOG_ID,
  ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_CI_SCRIPTS,
  ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_HOP_IDS,
  ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_POLICY_ID,
} from "@/lib/commercial/era20-storefront-fulfillment-flow-proof-era20-policy";

describe("era20-storefront-fulfillment-flow-proof-cert-live", () => {
  it("locks era20 fulfillment flow cert bundle", () => {
    expect(ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_POLICY_ID).toBe(
      "era20-storefront-fulfillment-flow-proof-v1",
    );
    expect(ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_BACKLOG_ID).toBe("KOS-E20-011");
    expect(ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_HOP_IDS).toHaveLength(5);
    expect(ERA20_STOREFRONT_FULFILLMENT_FLOW_PROOF_CI_SCRIPTS).toContain(
      "test:ci:era20-storefront-fulfillment-flow-proof",
    );
  });
});
