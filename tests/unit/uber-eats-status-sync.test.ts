import { beforeEach, describe, expect, it, vi } from "vitest";

const pushUberEatsStatus = vi.hoisted(() => vi.fn());
const getUberEatsCredentialsForUser = vi.hoisted(() => vi.fn());

vi.mock("@/services/integrations/uber-eats", () => ({
  updateOrderStatus: pushUberEatsStatus,
}));
vi.mock("@/services/integrations/uber-eats/uber-eats-service", () => ({
  getUberEatsCredentialsForUser,
}));

import {
  mapKitchenStatusToUberEats,
  syncUberEatsStatusFromKitchenOrder,
} from "@/services/integrations/uber-eats/status-sync.service";

describe("uber-eats status sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUberEatsCredentialsForUser.mockResolvedValue({
      clientId: "id",
      clientSecret: "secret",
      storeId: "store",
    });
    pushUberEatsStatus.mockResolvedValue({ ok: true, message: "Status updated" });
  });

  it("maps kitchen statuses to Uber API statuses", () => {
    expect(mapKitchenStatusToUberEats("CONFIRMED")).toBe("ACCEPTED");
    expect(mapKitchenStatusToUberEats("PREPARING")).toBe("ACCEPTED");
    expect(mapKitchenStatusToUberEats("READY")).toBe("READY_FOR_PICKUP");
    expect(mapKitchenStatusToUberEats("COMPLETED")).toBe("COMPLETED");
    expect(mapKitchenStatusToUberEats("CANCELLED")).toBe("CANCELLED");
    expect(mapKitchenStatusToUberEats("PENDING")).toBeNull();
  });

  it("pushes status to Uber when channel is UBER_EATS", async () => {
    const result = await syncUberEatsStatusFromKitchenOrder({
      userId: "owner-1",
      channelProvider: "UBER_EATS",
      externalOrderId: "ue-order-42",
      status: "READY",
    });

    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(false);
    expect(pushUberEatsStatus).toHaveBeenCalledWith(
      expect.objectContaining({ storeId: "store" }),
      "ue-order-42",
      "READY_FOR_PICKUP",
    );
  });

  it("skips non-Uber Eats orders", async () => {
    const result = await syncUberEatsStatusFromKitchenOrder({
      userId: "owner-1",
      channelProvider: "DOORDASH",
      externalOrderId: "dd-1",
      status: "READY",
    });

    expect(result.skipped).toBe(true);
    expect(pushUberEatsStatus).not.toHaveBeenCalled();
  });
});
