import { describe, expect, it } from "vitest";

import {
  KDS_BUMP_PACKING_ROUTE_E2E_POLICY_ID,
  KDS_BUMP_READY_STATUS,
  PACKING_VERIFY_PATH,
  ROUTE_BUILD_FULFILLMENT_TYPE,
  isDeliveryRouteBuildEligible,
  kdsBumpPackingRouteTicketTestId,
} from "@/lib/kitchen/kds-bump-packing-route-e2e-policy";

describe("KDS bump → packing verify → route lifecycle (QA-16)", () => {
  it("exports E2E policy constants", () => {
    expect(KDS_BUMP_PACKING_ROUTE_E2E_POLICY_ID).toBe("kds-bump-packing-route-e2e-v1");
    expect(PACKING_VERIFY_PATH).toBe("/dashboard/packing/verify");
    expect(KDS_BUMP_READY_STATUS).toBe("READY");
    expect(kdsBumpPackingRouteTicketTestId("abc")).toBe("kds-ticket-abc");
  });

  it("allows delivery orders with fulfillment day for route build", () => {
    expect(
      isDeliveryRouteBuildEligible({
        fulfillmentType: ROUTE_BUILD_FULFILLMENT_TYPE,
        pickupDate: new Date("2026-06-05"),
        status: "READY",
      }),
    ).toBe(true);
  });

  it("rejects pickup-only or completed orders for route build", () => {
    expect(
      isDeliveryRouteBuildEligible({
        fulfillmentType: "PICKUP",
        pickupDate: new Date("2026-06-05"),
        status: "READY",
      }),
    ).toBe(false);
    expect(
      isDeliveryRouteBuildEligible({
        fulfillmentType: ROUTE_BUILD_FULFILLMENT_TYPE,
        pickupDate: null,
        status: "READY",
      }),
    ).toBe(false);
    expect(
      isDeliveryRouteBuildEligible({
        fulfillmentType: ROUTE_BUILD_FULFILLMENT_TYPE,
        pickupDate: new Date("2026-06-05"),
        status: "COMPLETED",
      }),
    ).toBe(false);
  });
});
