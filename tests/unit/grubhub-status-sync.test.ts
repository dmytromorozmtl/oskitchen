import { beforeEach, describe, expect, it, vi } from "vitest";

const updateGrubhubMarketplaceOrderStatus = vi.hoisted(() => vi.fn());
const getGrubhubCredentialsForUser = vi.hoisted(() => vi.fn());

vi.mock("@/services/integrations/grubhub/grubhub-marketplace", () => ({
  updateGrubhubMarketplaceOrderStatus,
}));
vi.mock("@/services/integrations/grubhub/grubhub-credentials", () => ({
  getGrubhubCredentialsForUser,
}));

import {
  mapKitchenStatusToGrubhub,
  syncGrubhubStatusFromKitchenOrder,
} from "@/services/integrations/grubhub/status-sync.service";

describe("grubhub status sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getGrubhubCredentialsForUser.mockResolvedValue({
      apiKey: "key",
      merchantId: "merchant-1",
    });
    updateGrubhubMarketplaceOrderStatus.mockResolvedValue({ ok: true, message: "ok" });
  });

  it("maps kitchen statuses", () => {
    expect(mapKitchenStatusToGrubhub("READY")).toBe("ready_for_pickup");
    expect(mapKitchenStatusToGrubhub("COMPLETED")).toBe("delivered");
  });

  it("pushes status for GRUBHUB channel orders", async () => {
    const result = await syncGrubhubStatusFromKitchenOrder({
      userId: "owner-1",
      channelProvider: "GRUBHUB",
      externalOrderId: "gh-42",
      status: "READY",
    });

    expect(result.ok).toBe(true);
    expect(updateGrubhubMarketplaceOrderStatus).toHaveBeenCalledWith(
      expect.objectContaining({ merchantId: "merchant-1" }),
      "gh-42",
      "ready_for_pickup",
    );
  });
});
