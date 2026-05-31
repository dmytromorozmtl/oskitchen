import { describe, expect, it } from "vitest";

import {
  countryCodesMatch,
  normalizeCountryCode,
  shopifyAdminGid,
} from "@/lib/commercial/shopify-market-b2b-location-routing";
import {
  enrichShopifyOrderWithB2bRouting,
  resolveB2bRoutingForShopifyRestOrder,
} from "@/lib/integrations/shopify-b2b-order-routing";
import type { ShopifyMarketsSyncSettings } from "@/lib/integrations/shopify-markets-settings";
import type { StorefrontMarket } from "@/lib/storefront/markets";
import {
  parseShopifyB2bLocationsGraphQLResponse,
  suggestOsMarketIdForB2bLocation,
} from "@/services/integrations/shopify-market-b2b-location-service";
import { detectShopifyB2bLocationConflicts } from "@/services/integrations/shopify-markets-b2b-location-routing-service";

const osMarkets: StorefrontMarket[] = [
  {
    id: "us",
    name: "United States",
    region: "US",
    enabled: true,
    shopifyMarketId: "gid://shopify/Market/1",
    syncMode: "import",
  },
  {
    id: "ca",
    name: "Canada",
    region: "CA",
    enabled: true,
    shopifyMarketId: "gid://shopify/Market/2",
    syncMode: "import",
  },
];

describe("shopify-market-b2b-location-routing helpers", () => {
  it("builds Shopify GIDs from REST numeric ids", () => {
    expect(shopifyAdminGid("Company", 123)).toBe("gid://shopify/Company/123");
    expect(shopifyAdminGid("CompanyLocation", 456)).toBe("gid://shopify/CompanyLocation/456");
    expect(normalizeCountryCode(" us ")).toBe("US");
    expect(countryCodesMatch("US", "us")).toBe(true);
  });

  it("parses B2B locations GraphQL response", () => {
    const result = parseShopifyB2bLocationsGraphQLResponse({
      data: {
        companies: {
          edges: [
            {
              node: {
                id: "gid://shopify/Company/1",
                name: "Office Lunch Co",
                locations: {
                  edges: [
                    {
                      node: {
                        id: "gid://shopify/CompanyLocation/9",
                        name: "HQ",
                        shippingAddress: { city: "Austin", country: "US" },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.locations[0]?.countryCode).toBe("US");
    expect(result.locations[0]?.city).toBe("Austin");
  });

  it("suggests OS market by region country", () => {
    const marketId = suggestOsMarketIdForB2bLocation({
      countryCode: "US",
      osMarkets,
      discoveredMarkets: [
        {
          id: "gid://shopify/Market/1",
          name: "US",
          handle: "us",
          enabled: true,
          primary: true,
          currencyCode: "USD",
          regionCodes: ["US"],
        },
      ],
    });
    expect(marketId).toBe("us");
  });
});

describe("shopify-markets-b2b-location-routing conflicts", () => {
  it("detects region unmapped and company unlinked", () => {
    const { conflicts } = detectShopifyB2bLocationConflicts({
      b2bLocationImports: {
        "gid://shopify/CompanyLocation/1": {
          shopifyLocationId: "gid://shopify/CompanyLocation/1",
          shopifyCompanyId: "gid://shopify/Company/1",
          companyName: "Test Co",
          locationName: "Berlin",
          countryCode: "DE",
          city: "Berlin",
          suggestedOsMarketId: null,
          suggestedCompanyAccountId: null,
          importedAt: "2026-06-01T00:00:00.000Z",
          locationHash: "abc",
        },
      },
      b2bLocationLinks: {},
      b2bCompanyLinks: {},
      b2bLocationAuthority: "manual",
      existingConflicts: {},
    });

    const types = Object.values(conflicts).map((row) => row.conflictType);
    expect(types).toContain("REGION_UNMAPPED");
    expect(types).toContain("COMPANY_UNLINKED");
  });
});

describe("shopify-b2b-order-routing", () => {
  const marketsSync = {
    b2bCompanyLinks: { "gid://shopify/Company/1": "acc-1" },
    b2bLocationLinks: {
      "gid://shopify/CompanyLocation/9": {
        shopifyLocationId: "gid://shopify/CompanyLocation/9",
        shopifyCompanyId: "gid://shopify/Company/1",
        osMarketId: "us",
        companyAccountId: "acc-1",
        linkedAt: "2026-06-01T00:00:00.000Z",
      },
    },
  } as unknown as ShopifyMarketsSyncSettings;

  it("resolves routing hints from REST B2B order payload", () => {
    const hints = resolveB2bRoutingForShopifyRestOrder({
      order: { company: { id: 1, location_id: 9 } },
      marketsSync,
    });

    expect(hints?.companyAccountId).toBe("acc-1");
    expect(hints?.osMarketId).toBe("us");
  });

  it("enriches normalized order raw payload", () => {
    const enriched = enrichShopifyOrderWithB2bRouting({
      normalized: {
        provider: "SHOPIFY",
        externalOrderId: "1",
        normalizedStatus: "OPEN",
        customer: {},
        lineItems: [],
        fulfillment: { type: "DELIVERY" },
        totals: {},
        raw: { id: 1, company: { id: 1, location_id: 9 } },
      },
      connectionSettingsJson: { marketsSync },
    });

    const raw = enriched.raw as Record<string, unknown>;
    expect(raw._kitchenosB2bRouting).toBeTruthy();
  });
});
