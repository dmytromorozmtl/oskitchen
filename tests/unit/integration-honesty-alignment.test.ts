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
} from "@/lib/integrations/integration-honesty";

describe("integration honesty alignment", () => {
  it("has no marketplace placeholder integrations after Uber Direct BETA promotion", () => {
    expect(MARKETPLACE_PLACEHOLDER_INTEGRATION_IDS).toEqual([]);
    expect(MARKETPLACE_PLACEHOLDER_PROVIDER_KEYS).toEqual([]);
  });

  it("marks delivery marketplaces honestly in registry", () => {
    expect(getIntegrationById("doordash")?.status).toBe("LIVE");
    expect(getIntegrationById("uber-eats")?.status).toBe("LIVE");
    expect(getIntegrationById("grubhub")?.status).toBe("LIVE");
    expect(getIntegrationById("uber-direct")?.status).toBe("BETA");
  });

  it("includes Grubhub in channel catalog as LIVE (not placeholder)", () => {
    const grubhub = channelByKey("grubhub");
    expect(grubhub).toBeDefined();
    expect(grubhub?.isPlaceholder).toBe(false);
    expect(grubhub?.supportsLiveMode).toBe(true);
    expect(grubhub?.requiresOAuth).toBe(true);
    expect(grubhub?.setupRoute).toBe("/dashboard/integrations/grubhub");
  });

  it("resolves uber-direct as BETA channel without placeholder flag", () => {
    const resolved = resolveAllChannels([], false);
    const uberDirect = resolved.find((c) => c.providerKey === "uber-direct");
    expect(uberDirect).toBeDefined();
    expect(uberDirect?.isPlaceholder).toBe(false);
    expect(uberDirect?.effectiveStatus).not.toBe("LIVE");

    for (const key of ["doordash", "uber-eats", "grubhub"] as const) {
      const row = resolved.find((c) => c.providerKey === key);
      expect(row?.isPlaceholder).toBe(false);
    }
  });

  it("does not treat promoted integrations as marketplace placeholders", () => {
    expect(isMarketplacePlaceholderIntegration("uber-direct")).toBe(false);
    expect(isMarketplacePlaceholderProvider("uber-direct")).toBe(false);
    expect(isMarketplacePlaceholderIntegration("grubhub")).toBe(false);
    expect(isMarketplacePlaceholderProvider("grubhub")).toBe(false);
  });

  it("keeps integration registry setup routes stable", () => {
    expect(getIntegrationById("uber-direct")?.setupRoute).toBe(
      "/dashboard/integrations/uber-direct",
    );
    for (const row of INTEGRATION_REGISTRY) {
      expect(row.setupRoute).toMatch(/^\/dashboard\/integrations\//);
    }
  });
});
