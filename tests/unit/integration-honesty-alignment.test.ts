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
  it("lists only uber-direct as marketplace placeholder", () => {
    expect(MARKETPLACE_PLACEHOLDER_INTEGRATION_IDS).toEqual(["uber-direct"]);
    expect(MARKETPLACE_PLACEHOLDER_PROVIDER_KEYS).toEqual(["uber-direct"]);
  });

  it("marks delivery marketplaces as BETA except uber-direct placeholder", () => {
    expect(getIntegrationById("doordash")?.status).toBe("BETA");
    expect(getIntegrationById("uber-eats")?.status).toBe("BETA");
    expect(getIntegrationById("grubhub")?.status).toBe("BETA");
    expect(getIntegrationById("uber-direct")?.status).toBe("PLACEHOLDER");
  });

  it("includes Grubhub in channel catalog as BETA (not placeholder)", () => {
    const grubhub = channelByKey("grubhub");
    expect(grubhub).toBeDefined();
    expect(grubhub?.isPlaceholder).toBe(false);
    expect(grubhub?.statusType).toBe("PARTNER_ACCESS_REQUIRED");
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

    for (const key of ["doordash", "uber-eats", "grubhub"] as const) {
      const row = resolved.find((c) => c.providerKey === key);
      expect(row?.isPlaceholder).toBe(false);
    }
  });

  it("maps integration ids to honest preparation pages", () => {
    expect(marketplacePlaceholderIntegrationPage("uber-direct")).toBe(
      "/dashboard/integrations/uber-direct",
    );
    expect(isMarketplacePlaceholderIntegration("grubhub")).toBe(false);
    expect(isMarketplacePlaceholderProvider("grubhub")).toBe(false);
    expect(isMarketplacePlaceholderIntegration("shopify")).toBe(false);
  });

  it("keeps integration registry setup routes on placeholder pages", () => {
    for (const id of MARKETPLACE_PLACEHOLDER_INTEGRATION_IDS) {
      const entry = INTEGRATION_REGISTRY.find((row) => row.id === id);
      expect(entry?.setupRoute).toBe(marketplacePlaceholderIntegrationPage(id));
    }
  });
});
