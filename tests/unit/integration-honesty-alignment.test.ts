import { describe, expect, it } from "vitest";

import { channelByKey } from "@/lib/channels/channel-registry";
import { resolveAllChannels } from "@/lib/channels/channel-runtime";
import {
  getIntegrationById,
  INTEGRATION_REGISTRY,
} from "@/lib/integrations/integration-registry";
import {
  isMarketplacePlaceholderIntegration,
  isMarketplacePlaceholderProvider,
  MARKETPLACE_PLACEHOLDER_INTEGRATION_IDS,
  MARKETPLACE_PLACEHOLDER_PROVIDER_KEYS,
  marketplacePlaceholderIntegrationPage,
} from "@/lib/integrations/integration-honesty";

describe("integration honesty alignment", () => {
  it("lists marketplace placeholders in the honesty registry (DoorDash graduated to BETA)", () => {
    expect(MARKETPLACE_PLACEHOLDER_INTEGRATION_IDS).toEqual(["grubhub", "uber-direct"]);
    expect(MARKETPLACE_PLACEHOLDER_PROVIDER_KEYS).toEqual(["grubhub", "uber-direct"]);
  });

  it("marks remaining marketplace integrations as PLACEHOLDER; Uber Eats is BETA", () => {
    for (const id of MARKETPLACE_PLACEHOLDER_INTEGRATION_IDS) {
      expect(getIntegrationById(id)?.status).toBe("PLACEHOLDER");
    }
    expect(getIntegrationById("doordash")?.status).toBe("BETA");
    expect(getIntegrationById("uber-eats")?.status).toBe("BETA");
  });

  it("includes Grubhub in channel catalog as placeholder", () => {
    const grubhub = channelByKey("grubhub");
    expect(grubhub).toBeDefined();
    expect(grubhub?.isPlaceholder).toBe(true);
    expect(grubhub?.statusType).toBe("COMING_SOON");
    expect(grubhub?.setupRoute).toBe("/dashboard/integrations/grubhub");
  });

  it("resolves marketplace placeholders without live connector status", () => {
    const resolved = resolveAllChannels([], false);
    for (const key of MARKETPLACE_PLACEHOLDER_PROVIDER_KEYS) {
      const row = resolved.find((c) => c.providerKey === key);
      expect(row, key).toBeDefined();
      expect(row?.isPlaceholder).toBe(true);
      expect(["COMING_SOON", "PARTNER_ACCESS_REQUIRED"]).toContain(row?.effectiveStatus);
      expect(row?.effectiveStatus).not.toBe("LIVE");
      expect(row?.effectiveStatus).not.toBe("CONNECTED");
    }

    const doordash = resolved.find((c) => c.providerKey === "doordash");
    expect(doordash?.isPlaceholder).toBe(false);
    const uberEats = resolved.find((c) => c.providerKey === "uber-eats");
    expect(uberEats?.isPlaceholder).toBe(false);
  });

  it("maps integration ids to honest preparation pages", () => {
    expect(marketplacePlaceholderIntegrationPage("grubhub")).toBe(
      "/dashboard/integrations/grubhub",
    );
    expect(isMarketplacePlaceholderIntegration("doordash")).toBe(false);
    expect(isMarketplacePlaceholderProvider("uber-eats")).toBe(false);
    expect(isMarketplacePlaceholderProvider("grubhub")).toBe(true);
    expect(isMarketplacePlaceholderIntegration("shopify")).toBe(false);
  });

  it("keeps integration registry setup routes on placeholder pages", () => {
    for (const id of MARKETPLACE_PLACEHOLDER_INTEGRATION_IDS) {
      const entry = INTEGRATION_REGISTRY.find((row) => row.id === id);
      expect(entry?.setupRoute).toBe(marketplacePlaceholderIntegrationPage(id));
    }
  });
});
