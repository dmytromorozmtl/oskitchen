import { beforeEach, describe, expect, it } from "vitest";

import {
  fetchDoorDashOrders,
  getDoorDashCapabilitySnapshot,
} from "@/services/integrations/doordash/doordash-service";

describe("DoorDash order import", () => {
  beforeEach(() => {
    process.env.DOORDASH_API_KEY = "dd-api-key";
    process.env.DOORDASH_MERCHANT_ID = "merchant-1";
  });

  it("stays disabled while DoorDash remains placeholder-only", async () => {
    expect(getDoorDashCapabilitySnapshot()).toEqual({
      hasCredentials: true,
      liveQuoteReady: false,
      liveDeliveryReady: false,
      liveImportReady: false,
      placeholderMode: true,
    });

    await expect(fetchDoorDashOrders("owner-1")).rejects.toThrow(
      "DoorDash order import disabled",
    );
  });
});
