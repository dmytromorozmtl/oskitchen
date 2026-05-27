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
  it("lists all marketplace placeholders in the honesty registry", () => {
    expect(MARKETPLACE_PLACEHOLDER_INTEGRATION_IDS).toEqual([
      "doordash",
      "grubhub",
      "uber-eats",
      "uber-direct",
    ]);
    expect(MARKETPLACE_PLACEHOLDER_PROVIDER_KEYS).toEqual([
      "doordash",
      "grubhub",
      "uber-eats",
      "uber-direct",
    ]);
  });

  it("marks marketplace integrations as PLACEHOLDER in integration registry", () => {
    for (const id of MARKETPLACE_PLACEHOLDER_INTEGRATION_IDS) {
      expect(getIntegrationById(id)?.status).toBe("PLACEHOLDER");
    }
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
  });

  it("maps integration ids to honest preparation pages", () => {
    expect(marketplacePlaceholderIntegrationPage("doordash")).toBe(
      "/dashboard/integrations/doordash",
    );
    expect(marketplacePlaceholderIntegrationPage("grubhub")).toBe(
      "/dashboard/integrations/grubhub",
    );
    expect(isMarketplacePlaceholderIntegration("doordash")).toBe(true);
    expect(isMarketplacePlaceholderProvider("uber-eats")).toBe(true);
    expect(isMarketplacePlaceholderIntegration("shopify")).toBe(false);
  });

  it("keeps integration registry setup routes on placeholder pages", () => {
    for (const id of MARKETPLACE_PLACEHOLDER_INTEGRATION_IDS) {
      const entry = INTEGRATION_REGISTRY.find((row) => row.id === id);
      expect(entry?.setupRoute).toBe(marketplacePlaceholderIntegrationPage(id));
    }
  });
});
