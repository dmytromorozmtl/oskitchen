import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

import {
  inferTaxModeFromRegionCodes,
  regionsOverlapKitchenosTax,
  summarizeKitchenosTaxSettings,
} from "@/lib/commercial/shopify-market-tax-guard";
import { computeShopifyMarketTaxHash } from "@/lib/storefront/revalidate-shopify-market-tax";
import { presetTaxSettings } from "@/lib/storefront/tax-settings";
import type { StorefrontMarket } from "@/lib/storefront/markets";
import {
  buildShopifyMarketTaxConflictKey,
  countOpenShopifyMarketTaxConflicts,
  detectShopifyMarketTaxConflicts,
} from "@/services/integrations/shopify-markets-tax-guard-bidirectional-service";
import {
  listTaxGuardStorefrontMarkets,
  parseShopifyMarketTaxGraphQLResponse,
} from "@/services/integrations/shopify-market-tax-service";

const fixture = JSON.parse(
  readFileSync(join(process.cwd(), "tests/fixtures/shopify/market-tax-response.json"), "utf8"),
);

const settingsCenter = {
  storefront: {
    tax: presetTaxSettings("us_sales"),
    markets: [
      {
        id: "us",
        name: "United States",
        currency: "USD",
        enabled: true,
        shopifyMarketId: "gid://shopify/Market/1",
        syncMode: "import",
        taxAuthority: "manual",
      },
      {
        id: "eu",
        name: "Europe",
        currency: "EUR",
        enabled: true,
        shopifyMarketId: "gid://shopify/Market/2",
        syncMode: "bidirectional",
        taxAuthority: "kitchenos",
      },
    ] satisfies StorefrontMarket[],
  },
};

describe("shopify-market-tax-service", () => {
  it("parses market tax GraphQL fixture", () => {
    const parsed = parseShopifyMarketTaxGraphQLResponse(fixture);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.shopifyMarketId).toBe("gid://shopify/Market/8947691234567");
    expect(parsed.regionCodes).toEqual(["US", "US-CA"]);
    expect(parsed.currencyCode).toBe("USD");
    expect(parsed.inferredMode).toBe("us_sales");
  });

  it("lists tax guard storefront markets", () => {
    expect(listTaxGuardStorefrontMarkets(settingsCenter)).toHaveLength(2);
  });

  it("computes stable tax hash", () => {
    const hash = computeShopifyMarketTaxHash({
      regionCodes: ["US", "US-CA"],
      taxIncludedInPrices: false,
      totalRatePercent: 0,
      dutiesEnabled: null,
    });
    expect(hash).toHaveLength(16);
    expect(
      computeShopifyMarketTaxHash({
        regionCodes: ["US-CA", "US"],
        taxIncludedInPrices: false,
        totalRatePercent: 0,
        dutiesEnabled: null,
      }),
    ).toBe(hash);
  });
});

describe("shopify-market-tax-guard", () => {
  it("infers tax mode from region codes", () => {
    expect(inferTaxModeFromRegionCodes(["US"])).toBe("us_sales");
    expect(inferTaxModeFromRegionCodes(["CA"])).toBe("ca_sales");
    expect(inferTaxModeFromRegionCodes(["DE", "FR"])).toBe("eu_vat");
    expect(inferTaxModeFromRegionCodes(["AU"])).toBe("single");
  });

  it("detects region overlap with KitchenOS tax", () => {
    expect(regionsOverlapKitchenosTax(["US", "US-CA"], "US")).toBe(true);
    expect(regionsOverlapKitchenosTax(["CA"], "US")).toBe(false);
  });

  it("detects tax conflicts between Shopify hints and KitchenOS settings", () => {
    const kitchenSummary = summarizeKitchenosTaxSettings(presetTaxSettings("eu_vat"));
    const { conflicts, detected } = detectShopifyMarketTaxConflicts({
      markets: settingsCenter.storefront.markets,
      marketTaxImports: {
        us: {
          osMarketId: "us",
          shopifyMarketId: "gid://shopify/Market/1",
          importedAt: new Date().toISOString(),
          regionCodes: ["US"],
          currencyCode: "USD",
          taxIncludedInPrices: false,
          inferredMode: "us_sales",
          taxComponents: [{ id: "state", label: "State", ratePercent: 8.25 }],
          totalRatePercent: 8.25,
          dutiesEnabled: null,
          taxHash: "abc",
        },
        eu: {
          osMarketId: "eu",
          shopifyMarketId: "gid://shopify/Market/2",
          importedAt: new Date().toISOString(),
          regionCodes: ["DE", "FR"],
          currencyCode: "EUR",
          taxIncludedInPrices: true,
          inferredMode: "eu_vat",
          taxComponents: [{ id: "vat", label: "VAT", ratePercent: 19 }],
          totalRatePercent: 19,
          dutiesEnabled: true,
          taxHash: "def",
        },
      },
      kitchenosTaxSummary: kitchenSummary,
      existingConflicts: {},
    });

    expect(detected).toBeGreaterThan(0);
    expect(conflicts[buildShopifyMarketTaxConflictKey("us", "MODE_MISMATCH")]).toBeDefined();
    expect(conflicts[buildShopifyMarketTaxConflictKey("eu", "DUTY_UNCONFIGURED")]).toBeDefined();
    expect(countOpenShopifyMarketTaxConflicts(conflicts)).toBeGreaterThan(0);
  });
});
