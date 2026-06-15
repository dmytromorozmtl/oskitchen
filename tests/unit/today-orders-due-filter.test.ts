import { describe, expect, it } from "vitest";

import { orderQualifiesForDueTodayList } from "@/services/today/today-operational-signals";

const todayStart = new Date("2026-05-15T00:00:00.000Z");
const tomorrow = new Date("2026-05-16T00:00:00.000Z");

function baseCandidate(
  over: Partial<Parameters<typeof orderQualifiesForDueTodayList>[0]>,
): Parameters<typeof orderQualifiesForDueTodayList>[0] {
  return {
    status: "CONFIRMED",
    pickupDate: null,
    createdAt: new Date("2026-05-15T10:00:00.000Z"),
    orderType: "PREORDER",
    creationSource: "STOREFRONT",
    fulfillmentType: "PICKUP",
    fulfillmentDetail: "PICKUP",
    deliveryAddressJson: null,
    sourceMetadataJson: null,
    ...over,
  };
}

describe("orderQualifiesForDueTodayList", () => {
  it("includes order with pickup dated today", () => {
    expect(
      orderQualifiesForDueTodayList(
        baseCandidate({
          pickupDate: new Date("2026-05-15T12:00:00.000Z"),
          orderType: "POS_SALE",
          creationSource: "POS",
        }),
        todayStart,
        tomorrow,
      ),
    ).toBe(true);
  });

  it("excludes POS counter created today with null pickup when date not required", () => {
    expect(
      orderQualifiesForDueTodayList(
        baseCandidate({
          orderType: "POS_SALE",
          creationSource: "POS",
          fulfillmentType: "PICKUP",
          sourceMetadataJson: { pos: { fulfillmentIntent: "PICKUP_NOW" } },
        }),
        todayStart,
        tomorrow,
      ),
    ).toBe(false);
  });

  it("includes preorder created today with null pickup", () => {
    expect(orderQualifiesForDueTodayList(baseCandidate({ orderType: "PREORDER" }), todayStart, tomorrow)).toBe(
      true,
    );
  });
});
