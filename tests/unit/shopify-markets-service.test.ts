import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  SHOPIFY_MARKETS_REQUIRED_SCOPES,
} from "@/lib/integrations/shopify-markets-settings";
import {
  parseShopifyMarketsGraphQLResponse,
  summarizeShopifyMarketsForDisplay,
} from "@/services/integrations/shopify-markets-service";

const fixture = JSON.parse(
  readFileSync(join(process.cwd(), "tests/fixtures/shopify/markets-list-response.json"), "utf8"),
);

describe("shopify-markets-service", () => {
  it("parses GraphQL markets fixture into normalized rows", () => {
    const rows = parseShopifyMarketsGraphQLResponse(fixture);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.name).toBe("United States");
    expect(rows[0]?.primary).toBe(true);
    expect(rows[0]?.currencyCode).toBe("USD");
    expect(rows[0]?.regionCodes).toEqual(["US"]);
    expect(rows[1]?.regionCodes).toEqual(["CA"]);
  });

  it("returns empty array for malformed payload", () => {
    expect(parseShopifyMarketsGraphQLResponse({})).toEqual([]);
    expect(parseShopifyMarketsGraphQLResponse({ data: { markets: { nodes: null } } })).toEqual([]);
  });

  it("summarizes market counts for dashboard copy", () => {
    const rows = parseShopifyMarketsGraphQLResponse(fixture);
    expect(summarizeShopifyMarketsForDisplay(rows)).toContain("2 market");
  });

  it("parses marketsSync settings from connection JSON", () => {
    const settings = mergeShopifyMarketsSyncSettings(
      { apiVersion: "2025-01" },
      {
        lastDiscoveryAt: "2026-05-31T08:00:00.000Z",
        discoveredMarkets: parseShopifyMarketsGraphQLResponse(fixture),
        primaryShopifyMarketId: "gid://shopify/Market/8947691234567",
        discoveryError: null,
        requiredScopesNote: `Requires ${SHOPIFY_MARKETS_REQUIRED_SCOPES.join(", ")} on custom app.`,
      },
    );
    const parsed = parseShopifyMarketsSyncSettings(settings);
    expect(parsed.discoveredMarkets).toHaveLength(2);
    expect(parsed.primaryShopifyMarketId).toContain("Market/");
  });
});
