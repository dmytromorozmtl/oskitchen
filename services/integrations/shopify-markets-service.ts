import type { ShopifyCredentials } from "@/services/integrations/shopify";

export type ShopifyMarketRow = {
  id: string;
  handle: string | null;
  name: string;
  enabled: boolean;
  primary: boolean;
  currencyCode: string | null;
  regionCodes: string[];
};

export type ShopifyMarketsDiscoveryResult =
  | { ok: true; markets: ShopifyMarketRow[]; primaryMarketId: string | null }
  | { ok: false; error: string; scopeHint?: string };

function adminEndpoint(shopDomain: string, apiVersion: string): string {
  const shop = shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${shop}/admin/api/${apiVersion}/graphql.json`;
}

const LIST_MARKETS_QUERY = `
  query KitchenOSListMarkets($first: Int!) {
    markets(first: $first) {
      nodes {
        id
        name
        handle
        enabled
        primary
        currencySettings {
          baseCurrency {
            currencyCode
          }
        }
        regions(first: 25) {
          nodes {
            name
            ... on MarketRegionCountry {
              code
            }
          }
        }
      }
    }
  }
`;

type GraphQLMarketNode = {
  id?: string;
  name?: string;
  handle?: string | null;
  enabled?: boolean;
  primary?: boolean;
  currencySettings?: {
    baseCurrency?: { currencyCode?: string | null } | null;
  } | null;
  regions?: {
    nodes?: Array<{ name?: string | null; code?: string | null } | null> | null;
  } | null;
};

export function parseShopifyMarketsGraphQLResponse(json: unknown): ShopifyMarketRow[] {
  const data =
    json && typeof json === "object" ? (json as Record<string, unknown>).data : undefined;
  const markets =
    data && typeof data === "object"
      ? (data as Record<string, unknown>).markets
      : undefined;
  const nodes =
    markets && typeof markets === "object"
      ? (markets as Record<string, unknown>).nodes
      : undefined;

  if (!Array.isArray(nodes)) return [];

  return nodes
    .filter((node): node is GraphQLMarketNode => Boolean(node && typeof node === "object"))
    .map((node) => {
      const regionCodes = (node.regions?.nodes ?? [])
        .map((region) => region?.code?.trim().toUpperCase())
        .filter((code): code is string => Boolean(code));

      return {
        id: String(node.id ?? ""),
        handle: node.handle?.trim() || null,
        name: String(node.name ?? "Unnamed market"),
        enabled: node.enabled !== false,
        primary: node.primary === true,
        currencyCode: node.currencySettings?.baseCurrency?.currencyCode?.trim() || null,
        regionCodes: [...new Set(regionCodes)],
      };
    })
    .filter((row) => row.id.length > 0);
}

function scopeErrorMessage(errors: Array<{ message?: string; extensions?: { code?: string } }>): string {
  const messages = errors.map((e) => e.message).filter(Boolean);
  const joined = messages.join("; ") || "Shopify GraphQL error";
  const accessDenied = messages.some((m) =>
    /access denied|required access|not authorized|scope/i.test(m ?? ""),
  );
  if (accessDenied) {
    return `${joined} — add read_markets (and read_products for Phase 2) to your custom app.`;
  }
  return joined;
}

export async function listShopifyMarkets(
  creds: ShopifyCredentials,
  first = 50,
): Promise<ShopifyMarketsDiscoveryResult> {
  const version = creds.apiVersion ?? "2025-01";
  try {
    const res = await fetch(adminEndpoint(creds.shopDomain, version), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": creds.adminAccessToken,
      },
      body: JSON.stringify({ query: LIST_MARKETS_QUERY, variables: { first } }),
      cache: "no-store",
    });

    const json = (await res.json()) as {
      data?: unknown;
      errors?: Array<{ message?: string; extensions?: { code?: string } }>;
    };

    if (!res.ok) {
      return { ok: false, error: `Shopify Admin API HTTP ${res.status}` };
    }

    if (json.errors?.length) {
      const error = scopeErrorMessage(json.errors);
      return {
        ok: false,
        error,
        scopeHint: error.includes("read_markets") ? "read_markets" : undefined,
      };
    }

    const markets = parseShopifyMarketsGraphQLResponse(json);
    const primaryMarketId = markets.find((m) => m.primary)?.id ?? markets[0]?.id ?? null;

    return { ok: true, markets, primaryMarketId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: msg };
  }
}

export function summarizeShopifyMarketsForDisplay(markets: ShopifyMarketRow[]): string {
  if (markets.length === 0) return "No Shopify markets returned.";
  const enabled = markets.filter((m) => m.enabled).length;
  return `${markets.length} market(s) discovered · ${enabled} enabled`;
}
