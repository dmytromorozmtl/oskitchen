import { createHash } from "node:crypto";

import {
  countryCodesMatch,
  isShopifyMarketsB2bLocationRoutingEnabled,
  normalizeCountryCode,
} from "@/lib/commercial/shopify-market-b2b-location-routing";
import { SHOPIFY_MARKETS_B2B_REQUIRED_SCOPES } from "@/lib/commercial/shopify-market-b2b-guard";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyB2bLocationImportRow,
} from "@/lib/integrations/shopify-markets-settings";
import {
  parseStorefrontMarketsFromSettingsCenter,
  type StorefrontMarket,
} from "@/lib/storefront/markets";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import type { IntegrationConnection } from "@prisma/client";
import type { ShopifyCredentials } from "@/services/integrations/shopify";
import type { ShopifyMarketRow } from "@/services/integrations/shopify-markets-service";

export type ShopifyB2bLocationNode = {
  shopifyLocationId: string;
  shopifyCompanyId: string;
  companyName: string;
  locationName: string;
  countryCode: string | null;
  city: string | null;
};

export type ShopifyB2bLocationsFetchResult =
  | { ok: true; locations: ShopifyB2bLocationNode[] }
  | { ok: false; error: string; scopeHint?: string; unavailable?: boolean };

const B2B_LOCATIONS_QUERY = `
  query KitchenOSB2BLocations($first: Int!) {
    companies(first: $first) {
      edges {
        node {
          id
          name
          locations(first: 50) {
            edges {
              node {
                id
                name
                shippingAddress {
                  city
                  country
                }
              }
            }
          }
        }
      }
    }
  }
`;

function adminEndpoint(shopDomain: string, apiVersion: string): string {
  const shop = shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${shop}/admin/api/${apiVersion}/graphql.json`;
}

export function computeShopifyB2bLocationHash(input: {
  locationName: string;
  countryCode: string | null;
  city: string | null;
}): string {
  const payload = [
    input.locationName.trim().toLowerCase(),
    normalizeCountryCode(input.countryCode) ?? "",
    input.city?.trim().toLowerCase() ?? "",
  ].join("|");
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

export function parseShopifyB2bLocationsGraphQLResponse(json: unknown): ShopifyB2bLocationsFetchResult {
  const root = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
  const errors = Array.isArray(root.errors)
    ? root.errors
        .map((e) => (e && typeof e === "object" ? String((e as { message?: string }).message ?? "") : ""))
        .filter(Boolean)
    : [];

  if (errors.length > 0) {
    const joined = errors.join("; ");
    const accessDenied =
      /access denied|unauthorized|not authorized|required access|scope/i.test(joined) ||
      /companies/i.test(joined);
    return {
      ok: false,
      error: joined,
      scopeHint: accessDenied ? SHOPIFY_MARKETS_B2B_REQUIRED_SCOPES.join(", ") : undefined,
      unavailable: accessDenied,
    };
  }

  const data = root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : null;
  const companiesRoot =
    data?.companies && typeof data.companies === "object"
      ? (data.companies as Record<string, unknown>)
      : null;
  const edges = companiesRoot?.edges;
  if (!Array.isArray(edges)) {
    return { ok: false, error: "Missing companies in Shopify response.", unavailable: true };
  }

  const locations: ShopifyB2bLocationNode[] = [];

  for (const edge of edges) {
    if (!edge || typeof edge !== "object") continue;
    const node = (edge as Record<string, unknown>).node;
    if (!node || typeof node !== "object") continue;
    const company = node as Record<string, unknown>;
    const shopifyCompanyId = typeof company.id === "string" ? company.id : "";
    const companyName = typeof company.name === "string" ? company.name.trim() : "";
    if (!shopifyCompanyId || !companyName) continue;

    const locEdges =
      company.locations && typeof company.locations === "object"
        ? (company.locations as Record<string, unknown>).edges
        : undefined;
    if (!Array.isArray(locEdges)) continue;

    for (const locEdge of locEdges) {
      if (!locEdge || typeof locEdge !== "object") continue;
      const locNode = (locEdge as Record<string, unknown>).node;
      if (!locNode || typeof locNode !== "object") continue;
      const loc = locNode as Record<string, unknown>;
      const shopifyLocationId = typeof loc.id === "string" ? loc.id : "";
      const locationName = typeof loc.name === "string" ? loc.name.trim() : companyName;
      if (!shopifyLocationId) continue;

      const ship =
        loc.shippingAddress && typeof loc.shippingAddress === "object"
          ? (loc.shippingAddress as Record<string, unknown>)
          : null;
      const countryCode = normalizeCountryCode(
        typeof ship?.country === "string" ? ship.country : null,
      );
      const city = typeof ship?.city === "string" ? ship.city.trim() : null;

      locations.push({
        shopifyLocationId,
        shopifyCompanyId,
        companyName,
        locationName,
        countryCode,
        city,
      });
    }
  }

  return { ok: true, locations };
}

export async function fetchShopifyB2bLocations(
  creds: ShopifyCredentials,
  first = 50,
): Promise<ShopifyB2bLocationsFetchResult> {
  const version = creds.apiVersion ?? "2025-01";
  const res = await fetch(adminEndpoint(creds.shopDomain, version), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": creds.adminAccessToken,
    },
    body: JSON.stringify({ query: B2B_LOCATIONS_QUERY, variables: { first } }),
    cache: "no-store",
  });

  const json = (await res.json()) as unknown;
  if (!res.ok) {
    return { ok: false, error: `HTTP ${res.status}`, unavailable: res.status === 403 };
  }
  return parseShopifyB2bLocationsGraphQLResponse(json);
}

export function suggestOsMarketIdForB2bLocation(input: {
  countryCode: string | null;
  osMarkets: StorefrontMarket[];
  discoveredMarkets: ShopifyMarketRow[];
}): string | null {
  const country = normalizeCountryCode(input.countryCode);
  if (!country) return null;

  for (const market of input.osMarkets) {
    if (market.enabled === false) continue;
    if (normalizeCountryCode(market.region) === country) {
      return market.id;
    }
  }

  for (const market of input.osMarkets) {
    if (market.enabled === false || !market.shopifyMarketId?.trim()) continue;
    const discovered = input.discoveredMarkets.find((row) => row.id === market.shopifyMarketId);
    if (discovered?.regionCodes.some((code) => countryCodesMatch(code, country))) {
      return market.id;
    }
  }

  return null;
}

export function buildB2bLocationImportRow(input: {
  location: ShopifyB2bLocationNode;
  suggestedOsMarketId: string | null;
  suggestedCompanyAccountId: string | null;
  importedAt: string;
}): ShopifyB2bLocationImportRow {
  return {
    shopifyLocationId: input.location.shopifyLocationId,
    shopifyCompanyId: input.location.shopifyCompanyId,
    companyName: input.location.companyName,
    locationName: input.location.locationName,
    countryCode: input.location.countryCode,
    city: input.location.city,
    suggestedOsMarketId: input.suggestedOsMarketId,
    suggestedCompanyAccountId: input.suggestedCompanyAccountId,
    importedAt: input.importedAt,
    locationHash: computeShopifyB2bLocationHash({
      locationName: input.location.locationName,
      countryCode: input.location.countryCode,
      city: input.location.city,
    }),
  };
}

export async function importShopifyB2bLocationsForConnection(input: {
  userId: string;
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
  settingsCenterJson: unknown;
  skipUnchanged?: boolean;
}): Promise<
  | { ok: true; locationsImported: number; locationsUnchanged: number; locationsTotal: number }
  | { ok: false; error: string; unavailable?: boolean }
> {
  if (!isShopifyMarketsB2bLocationRoutingEnabled()) {
    return {
      ok: false,
      error: "Shopify B2B location routing is disabled (SHOPIFY_MARKETS_B2B_LOCATION_ROUTING).",
    };
  }

  const fetchResult = await fetchShopifyB2bLocations(input.creds);
  const now = new Date().toISOString();
  const current = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  const osMarkets = parseStorefrontMarketsFromSettingsCenter(input.settingsCenterJson);

  if (!fetchResult.ok) {
    await prisma.integrationConnection.update({
      where: { id: input.connection.id },
      data: {
        settingsJson: toInputJsonValue(
          mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
            lastB2bLocationImportAt: now,
            b2bLocationImportError: fetchResult.error,
          }),
        ),
      },
    });
    return { ok: false, error: fetchResult.error, unavailable: fetchResult.unavailable };
  }

  let locationsImported = 0;
  let locationsUnchanged = 0;
  const b2bLocationImports: Record<string, ShopifyB2bLocationImportRow> = {
    ...current.b2bLocationImports,
  };

  for (const location of fetchResult.locations) {
    const suggestedOsMarketId = suggestOsMarketIdForB2bLocation({
      countryCode: location.countryCode,
      osMarkets,
      discoveredMarkets: current.discoveredMarkets,
    });
    const suggestedCompanyAccountId =
      current.b2bCompanyLinks[location.shopifyCompanyId] ?? null;

    const row = buildB2bLocationImportRow({
      location,
      suggestedOsMarketId,
      suggestedCompanyAccountId,
      importedAt: now,
    });

    const previous = b2bLocationImports[row.shopifyLocationId];
    if (
      input.skipUnchanged &&
      previous?.locationHash === row.locationHash &&
      previous?.suggestedOsMarketId === row.suggestedOsMarketId &&
      previous?.suggestedCompanyAccountId === row.suggestedCompanyAccountId
    ) {
      locationsUnchanged += 1;
      continue;
    }

    b2bLocationImports[row.shopifyLocationId] = row;
    locationsImported += 1;
  }

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          lastB2bLocationImportAt: now,
          b2bLocationImportError: null,
          b2bLocationImports,
        }),
      ),
    },
  });

  return {
    ok: true,
    locationsImported,
    locationsUnchanged,
    locationsTotal: fetchResult.locations.length,
  };
}
