import { beforeEach, describe, expect, it, vi } from "vitest";

const updateDoorDashMarketplaceOrderStatus = vi.hoisted(() => vi.fn());
const getDoorDashCredentialsForUser = vi.hoisted(() => vi.fn());

vi.mock("@/services/integrations/doordash/doordash-marketplace", () => ({
  updateDoorDashMarketplaceOrderStatus,
}));
vi.mock("@/services/integrations/doordash/doordash-credentials", () => ({
  getDoorDashCredentialsForUser,
}));

import {
  mapKitchenStatusToDoorDash,
  syncDoorDashStatusFromKitchenOrder,
} from "@/services/integrations/doordash/status-sync.service";

describe("doordash status sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDoorDashCredentialsForUser.mockResolvedValue({
      apiKey: "dd-key",
      merchantId: "merchant-1",
    });
    updateDoorDashMarketplaceOrderStatus.mockResolvedValue({
      ok: true,
      message: "DoorDash status updated",
    });
  });

  it("maps kitchen statuses to DoorDash API statuses", () => {
    expect(mapKitchenStatusToDoorDash("CONFIRMED")).toBe("confirmed");
    expect(mapKitchenStatusToDoorDash("READY")).toBe("ready_for_pickup");
    expect(mapKitchenStatusToDoorDash("COMPLETED")).toBe("delivered");
    expect(mapKitchenStatusToDoorDash("CANCELLED")).toBe("cancelled");
  });

  it("pushes status to DoorDash when channel is DOORDASH", async () => {
    const result = await syncDoorDashStatusFromKitchenOrder({
      userId: "owner-1",
      channelProvider: "DOORDASH",
      externalOrderId: "dd-order-42",
      status: "READY",
    });

    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(false);
    expect(updateDoorDashMarketplaceOrderStatus).toHaveBeenCalledWith(
      { apiKey: "dd-key", merchantId: "merchant-1" },
      "dd-order-42",
      "ready_for_pickup",
    );
  });
});
