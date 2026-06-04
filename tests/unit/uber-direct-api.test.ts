import { describe, expect, it } from "vitest";

import { buildUberDirectQuoteBody, normalizeDeliveryStatus } from "@/services/delivery/uber-direct";

describe("uber direct api helpers", () => {
  it("builds quote body with pickup and dropoff addresses", () => {
    const body = buildUberDirectQuoteBody({
      pickup: { address: "123 Kitchen St", latitude: 40.7, longitude: -74.0 },
      dropoff: { address: "456 Guest Ave", latitude: 40.71, longitude: -74.01 },
      orderId: "order-1",
    });
    expect(body.pickup?.address?.street_address).toEqual(["123 Kitchen St"]);
    expect(body.pickup?.location).toEqual({ latitude: 40.7, longitude: -74.0 });
    expect(body.dropoff?.address?.street_address).toEqual(["456 Guest Ave"]);
    expect(body.external_store_id).toBe("order-1");
  });

  it("normalizes Uber delivery status strings", () => {
    expect(normalizeDeliveryStatus({ status: "delivered" })).toBe("COMPLETED");
    expect(normalizeDeliveryStatus({ status: "pickup" })).toBe("PICKUP");
    expect(normalizeDeliveryStatus({ status: "canceled" })).toBe("CANCELLED");
    expect(normalizeDeliveryStatus({ event_type: "delivery.failed" })).toBe("FAILED");
  });
});
