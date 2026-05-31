import { describe, expect, it, vi } from "vitest";

import { validatePartnerAppsConfig, loadPartnerAppsConfig } from "@/lib/commercial/partner-apps-catalog";
import {
  filterExtensionsCatalog,
  mergeExtensionsCatalog,
  summarizeExtensionsCatalog,
} from "@/services/platform/extensions-catalog-service";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    integrationConnection: {
      findMany: vi.fn(),
    },
  },
}));

describe("partner-apps-catalog", () => {
  it("loads config with unique ids and valid categories", () => {
    const config = loadPartnerAppsConfig();
    expect(config.version).toBeGreaterThanOrEqual(1);
    expect(config.apps.length).toBeGreaterThan(0);
    expect(config.roadmap.length).toBeGreaterThan(0);
    expect(validatePartnerAppsConfig(config)).toEqual([]);
  });
});

describe("extensions-catalog-service", () => {
  it("merges first-party, partner, and roadmap entries", () => {
    const items = mergeExtensionsCatalog([
      { provider: "DOORDASH", status: "CONNECTED" },
      { provider: "SHOPIFY", status: "NEEDS_AUTH" },
    ]);

    expect(items.some((i) => i.id === "doordash" && i.kind === "first_party")).toBe(true);
    expect(items.some((i) => i.id === "shopify" && i.kind === "first_party")).toBe(true);
    expect(items.some((i) => i.id === "partner-klaviyo-sync" && i.kind === "partner")).toBe(true);
    expect(items.some((i) => i.id === "roadmap-oauth-app-install" && i.kind === "roadmap")).toBe(true);
  });

  it("marks doordash connected when connection exists", () => {
    const items = mergeExtensionsCatalog([{ provider: "DOORDASH", status: "CONNECTED" }]);
    const doordash = items.find((i) => i.id === "doordash");
    expect(doordash?.connectionState).toBe("connected");
  });

  it("inventory sync shows connected when shopify or woo connected", () => {
    const items = mergeExtensionsCatalog([{ provider: "WOOCOMMERCE", status: "CONNECTED" }]);
    const inv = items.find((i) => i.id === "inventory-sync");
    expect(inv?.connectionState).toBe("connected");
  });

  it("summarizes catalog counts", () => {
    const items = mergeExtensionsCatalog([{ provider: "DOORDASH", status: "CONNECTED" }]);
    const summary = summarizeExtensionsCatalog(items);
    expect(summary.total).toBe(items.length);
    expect(summary.connectedFirstParty).toBeGreaterThanOrEqual(1);
    expect(summary.certifiedPartners).toBeGreaterThanOrEqual(1);
    expect(summary.roadmap).toBeGreaterThanOrEqual(1);
  });

  it("filters by category and query", () => {
    const items = mergeExtensionsCatalog([]);
    const marketing = filterExtensionsCatalog(items, { category: "marketing", kind: "all" });
    expect(marketing.every((i) => i.category === "marketing")).toBe(true);

    const klaviyo = filterExtensionsCatalog(items, { query: "klaviyo" });
    expect(klaviyo.some((i) => i.id === "partner-klaviyo-sync")).toBe(true);
  });
});
