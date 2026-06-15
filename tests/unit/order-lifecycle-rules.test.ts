import { describe, expect, it } from "vitest";

import {
  ORDER_DB_STATUSES,
  allowedNextDbStatuses,
  type OrderLikeForLifecycle,
  validateOrderDbStatusTransition,
} from "@/lib/workflows/order-lifecycle-rules";

function makeOrder(
  overrides: Partial<OrderLikeForLifecycle> = {},
): OrderLikeForLifecycle {
  return {
    id: "order-1",
    status: "PENDING",
    fulfillmentType: "PICKUP",
    fulfillmentDetail: "PICKUP",
    orderType: "CUSTOM_ORDER",
    creationSource: "DASHBOARD",
    sourceMetadataJson: null,
    pickupDate: new Date("2026-05-26T12:00:00.000Z"),
    deliveryAddressJson: null,
    paymentStatus: "paid",
    orderItemsCount: 1,
    ...overrides,
  };
}

describe("order lifecycle rules", () => {
  it("publishes the expected direct transition map", () => {
    expect(allowedNextDbStatuses("PENDING")).toEqual(["CONFIRMED", "CANCELLED"]);
    expect(allowedNextDbStatuses("CONFIRMED")).toEqual(["PREPARING", "PENDING", "CANCELLED"]);
    expect(allowedNextDbStatuses("PREPARING")).toEqual(["READY", "CONFIRMED", "CANCELLED"]);
    expect(allowedNextDbStatuses("READY")).toEqual(["COMPLETED", "PREPARING", "CANCELLED"]);
    expect(allowedNextDbStatuses("COMPLETED")).toEqual([]);
    expect(allowedNextDbStatuses("CANCELLED")).toEqual([]);
  });

  it("accepts each valid direct status transition", () => {
    const validPairs: Array<[OrderLikeForLifecycle["status"], OrderLikeForLifecycle["status"]]> = [
      ["PENDING", "CONFIRMED"],
      ["PENDING", "CANCELLED"],
      ["CONFIRMED", "PREPARING"],
      ["CONFIRMED", "PENDING"],
      ["CONFIRMED", "CANCELLED"],
      ["PREPARING", "READY"],
      ["PREPARING", "CONFIRMED"],
      ["PREPARING", "CANCELLED"],
      ["READY", "COMPLETED"],
      ["READY", "PREPARING"],
      ["READY", "CANCELLED"],
    ];

    for (const [from, to] of validPairs) {
      expect(
        validateOrderDbStatusTransition(
          makeOrder({
            status: from,
            fulfillmentType: from === "READY" && to === "COMPLETED" ? "DELIVERY" : "PICKUP",
            deliveryAddressJson:
              from === "READY" && to === "COMPLETED" ? { line1: "123 Main" } : null,
          }),
          to,
        ),
      ).toEqual({ ok: true });
    }
  });

  it("enforces the full direct transition matrix exhaustively", () => {
    for (const from of ORDER_DB_STATUSES) {
      for (const to of ORDER_DB_STATUSES) {
        if (from === to) continue;
        const result = validateOrderDbStatusTransition(makeOrder({ status: from }), to);
        const allowed = allowedNextDbStatuses(from).includes(to);
        expect(result.ok, `${from} -> ${to}`).toBe(allowed);
        if (!allowed) {
          expect(result).toMatchObject({
            ok: false,
            message: expect.stringContaining("Cannot move"),
          });
        }
      }
    }
  });

  it("rejects no-op status transitions for every state", () => {
    for (const status of ORDER_DB_STATUSES) {
      expect(validateOrderDbStatusTransition(makeOrder({ status }), status)).toEqual({
        ok: false,
        message: "Order is already at this status.",
      });
    }
  });

  it("rejects invalid direct status transitions", () => {
    const invalidPairs: Array<[OrderLikeForLifecycle["status"], OrderLikeForLifecycle["status"]]> = [
      ["PENDING", "READY"],
      ["PENDING", "COMPLETED"],
      ["CONFIRMED", "READY"],
      ["PREPARING", "COMPLETED"],
      ["COMPLETED", "READY"],
      ["CANCELLED", "PENDING"],
    ];

    for (const [from, to] of invalidPairs) {
      const result = validateOrderDbStatusTransition(makeOrder({ status: from }), to);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain("Cannot move");
      }
    }
  });

  it("allows completion when payment is in an accepted terminal state", () => {
    for (const paymentStatus of ["paid", "partial", "external", "not_required"] as const) {
      expect(
        validateOrderDbStatusTransition(
          makeOrder({
            status: "READY",
            paymentStatus,
          }),
          "COMPLETED",
        ),
      ).toEqual({ ok: true });
    }
  });

  it("blocks advancement when invariant checks are missing", () => {
    expect(
      validateOrderDbStatusTransition(makeOrder({ orderItemsCount: 0 }), "CONFIRMED"),
    ).toEqual({
      ok: false,
      message: "Add at least one line item before advancing this order.",
      fixHref: "/dashboard/orders/order-1",
    });

    expect(
      validateOrderDbStatusTransition(
        makeOrder({
          status: "CONFIRMED",
          fulfillmentType: "DELIVERY",
          pickupDate: null,
          deliveryAddressJson: { line1: "123 Main" },
        }),
        "PREPARING",
      ),
    ).toEqual({
      ok: false,
      message: "Set a pickup or service date before sending this order to production.",
      fixHref: "/dashboard/orders/order-1?tab=fulfillment",
    });

    expect(
      validateOrderDbStatusTransition(
        makeOrder({
          status: "READY",
          fulfillmentType: "DELIVERY",
          deliveryAddressJson: null,
        }),
        "COMPLETED",
      ),
    ).toEqual({
      ok: false,
      message: "Delivery orders need a saved delivery address before ready or complete.",
      fixHref: "/dashboard/orders/order-1",
    });

    expect(
      validateOrderDbStatusTransition(
        makeOrder({
          status: "READY",
          paymentStatus: "pending",
        }),
        "COMPLETED",
      ),
    ).toEqual({
      ok: false,
      message:
        "Resolve payment status to paid, partial, external, or not_required before completing.",
      fixHref: "/dashboard/orders/order-1",
    });
  });
});
