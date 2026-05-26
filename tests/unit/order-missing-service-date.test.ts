import { describe, expect, it } from "vitest";

import { orderMissingRequiredServiceDate } from "@/lib/fulfillment/fulfillment-requirements";

const base = {
  status: "PENDING" as const,
  orderType: "PREORDER" as string | null,
  creationSource: "STOREFRONT" as string | null,
  fulfillmentType: "PICKUP" as const,
  fulfillmentDetail: "PICKUP" as string | null,
  pickupDate: null as Date | null,
  deliveryAddressJson: null,
  sourceMetadataJson: null,
};

describe("orderMissingRequiredServiceDate", () => {
  it("returns false for POS counter walk-in when pickup is null", () => {
    expect(
      orderMissingRequiredServiceDate({
        ...base,
        status: "CONFIRMED",
        creationSource: "POS",
        orderType: "POS_SALE",
        fulfillmentType: "PICKUP",
        fulfillmentDetail: "PICKUP",
        sourceMetadataJson: { pos: { fulfillmentIntent: "PICKUP_NOW" } },
      }),
    ).toBe(false);
  });

  it("returns true for preorder without pickup date", () => {
    expect(orderMissingRequiredServiceDate({ ...base, orderType: "PREORDER", pickupDate: null })).toBe(true);
  });

  it("returns false when pickup date is set", () => {
    expect(
      orderMissingRequiredServiceDate({
        ...base,
        orderType: "PREORDER",
        pickupDate: new Date("2026-06-01"),
      }),
    ).toBe(false);
  });
});
