import { afterEach, describe, expect, it, vi } from "vitest";

import { getIntegrationById } from "@/lib/integrations/integration-registry";
import {
  createDoorDashDelivery,
  getDoorDashCapabilitySnapshot,
  getDoorDashQuote,
} from "@/services/integrations/doordash/doordash-service";
import {
  createGrubhubOrder,
  getGrubhubCapabilitySnapshot,
  getGrubhubMenu,
} from "@/services/integrations/grubhub/grubhub-service";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("partner integration placeholder truth", () => {
  it("marks DoorDash as BETA and Grubhub as placeholder in registry", () => {
    expect(getIntegrationById("doordash")?.status).toBe("BETA");
    expect(getIntegrationById("grubhub")?.status).toBe("PLACEHOLDER");
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

    vi.unstubAllGlobals();
  });

  it("keeps Grubhub placeholder-only even when credentials exist", async () => {
    process.env.GRUBHUB_API_KEY = "gh-api-key";
    process.env.GRUBHUB_MERCHANT_ID = "merchant-1";

    expect(getGrubhubCapabilitySnapshot()).toEqual({
      hasCredentials: true,
      liveOrderReady: false,
      liveMenuReady: false,
      placeholderMode: true,
    });

    await expect(getGrubhubMenu("owner-1")).resolves.toMatchObject({
      ok: false,
      items: [],
    });

    await expect(createGrubhubOrder("owner-1", { externalOrderId: "gh-test-1" })).resolves.toMatchObject({
      ok: false,
      delivery: null,
      externalOrderId: "gh-test-1",
    });
  });
});
