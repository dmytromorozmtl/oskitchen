import { beforeEach, describe, expect, it, vi } from "vitest";

const updateSkipMarketplaceOrderStatus = vi.hoisted(() => vi.fn());
const getSkipCredentialsForUser = vi.hoisted(() => vi.fn());

vi.mock("@/services/integrations/skip/skip-marketplace", () => ({
  updateSkipMarketplaceOrderStatus,
}));
vi.mock("@/services/integrations/skip/skip-credentials", () => ({
  getSkipCredentialsForUser,
}));

import {
  mapKitchenStatusToSkip,
  syncSkipStatusFromKitchenOrder,
} from "@/services/integrations/skip/status-sync.service";

describe("skip status sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSkipCredentialsForUser.mockResolvedValue({
      clientId: "id",
      clientSecret: "secret",
      restaurantId: "rest-1",
    });
    updateSkipMarketplaceOrderStatus.mockResolvedValue({ ok: true, message: "ok" });
  });

  it("maps kitchen statuses", () => {
    expect(mapKitchenStatusToSkip("READY")).toBe("ready_for_pickup");
    expect(mapKitchenStatusToSkip("COMPLETED")).toBe("delivered");
  });

  it("pushes status for SKIP channel orders", async () => {
    const result = await syncSkipStatusFromKitchenOrder({
      userId: "owner-1",
      channelProvider: "SKIP",
      externalOrderId: "skip-42",
      status: "READY",
    });

    expect(result.ok).toBe(true);
    expect(updateSkipMarketplaceOrderStatus).toHaveBeenCalledWith(
      expect.objectContaining({ restaurantId: "rest-1" }),
      "skip-42",
      "ready_for_pickup",
    );
  });
});
