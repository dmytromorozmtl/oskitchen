import { afterEach, describe, expect, it, vi } from "vitest";

import { getIntegrationById } from "@/lib/integrations/integration-registry";
import {
  createDoorDashDelivery,
  getDoorDashCapabilitySnapshot,
  getDoorDashQuote,
} from "@/services/integrations/doordash/doordash-service";
import {
  getGrubhubCapabilitySnapshot,
} from "@/services/integrations/grubhub/grubhub-service";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllGlobals();
});

describe("partner integration placeholder truth", () => {
  it("marks marketplace delivery integrations as BETA in registry", () => {
    expect(getIntegrationById("doordash")?.status).toBe("LIVE");
    expect(getIntegrationById("uber-eats")?.status).toBe("LIVE");
    expect(getIntegrationById("grubhub")?.status).toBe("LIVE");
    expect(getIntegrationById("uber-direct")?.status).toBe("BETA");
  });

  it("enables DoorDash BETA flows when credentials exist", async () => {
    process.env.DOORDASH_API_KEY = "door-api-key";
    process.env.DOORDASH_MERCHANT_ID = "merchant-1";

    expect(getDoorDashCapabilitySnapshot()).toMatchObject({
      hasCredentials: true,
      liveImportReady: true,
      placeholderMode: false,
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({}),
      }),
    );

    await expect(getDoorDashQuote("123 Main St", "456 Oak Ave")).resolves.toMatchObject({
      ok: false,
      fee: null,
      etaMinutes: null,
    });

    await expect(
      createDoorDashDelivery(null, "owner-1", {
        pickupAddress: "123 Main St",
        deliveryAddress: "456 Oak Ave",
      }),
    ).resolves.toMatchObject({
      ok: false,
      delivery: null,
      trackingUrl: null,
    });
  });

  it("enables Grubhub BETA capability snapshot when credentials exist", () => {
    process.env.GRUBHUB_API_KEY = "gh-api-key";
    process.env.GRUBHUB_MERCHANT_ID = "merchant-1";

    expect(getGrubhubCapabilitySnapshot()).toMatchObject({
      hasCredentials: true,
      liveOrderReady: true,
      liveMenuReady: true,
      placeholderMode: false,
    });
  });
});
