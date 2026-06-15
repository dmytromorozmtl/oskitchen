import { describe, expect, it } from "vitest";

import { getStorefrontDuplicateOrderNotice } from "@/lib/storefront/storefront-duplicate-order-notice";

describe("storefront duplicate order notice", () => {
  it("returns null when the page is not reached through duplicate-submit recovery", () => {
    expect(
      getStorefrontDuplicateOrderNotice({
        duplicate: false,
        paymentMode: "ONLINE_PAYMENT",
        paymentStatus: "PENDING",
      }),
    ).toBeNull();
  });

  it("warns when an identical online order is already pending", () => {
    expect(
      getStorefrontDuplicateOrderNotice({
        duplicate: true,
        paymentMode: "ONLINE_PAYMENT",
        paymentStatus: "PENDING",
      }),
    ).toEqual({
      tone: "warning",
      message:
        "We found a recent identical order and reused it to avoid starting a second card payment. Use the original checkout window or wait for confirmation.",
    });
  });

  it("keeps retry guidance when the reused online order is failed", () => {
    expect(
      getStorefrontDuplicateOrderNotice({
        duplicate: true,
        paymentMode: "ONLINE_PAYMENT",
        paymentStatus: "FAILED",
      }),
    ).toEqual({
      tone: "info",
      message:
        "We found a recent identical order and reused it instead of creating a duplicate. Retry payment below when you are ready.",
    });
  });

  it("uses a generic reuse message for non-card duplicates", () => {
    expect(
      getStorefrontDuplicateOrderNotice({
        duplicate: true,
        paymentMode: "PAY_LATER",
        paymentStatus: "NOT_REQUIRED",
      }),
    ).toEqual({
      tone: "info",
      message: "We found a recent identical order and reused it instead of creating a duplicate.",
    });
  });
});
