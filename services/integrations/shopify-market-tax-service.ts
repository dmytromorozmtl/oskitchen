import type { IntegrationConnection } from "@prisma/client";

import {
  inferTaxModeFromRegionCodes,
  summarizeKitchenosTaxSettings,
} from "@/lib/commercial/shopify-market-tax-guard";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketTaxImportRow,
} from "@/lib/integrations/shopify-markets-settings";
import {
  parseStorefrontMarketsFromSettingsCenter,
  type StorefrontMarket,
} from "@/lib/storefront/markets";
import {
  computeShopifyMarketTaxHash,
} from "@/lib/storefront/revalidate-shopify-market-tax";
import {
  parseTaxSettingsFromSettingsCenter,
  presetTaxSettings,
} from "@/lib/storefront/tax-settings";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import type { ShopifyCredentials } from "@/services/integrations/shopify";
import { gidTail } from "@/services/integrations/shopify-market-prices-service";

export type ShopifyMarketTaxFetchResult =
  | {
      ok: true;
      shopifyMarketId: string;
      regionCodes: string[];
      currencyCode: string | null;
      taxIncludedInPrices: boolean | null;
      inferredMode: ReturnType<typeof inferTaxModeFromRegionCodes>;
      taxComponents: ShopifyMarketTaxImportRow["taxComponents"];
      totalRatePercent: number;
      dutiesEnabled: boolean | null;
    }
  | { ok: false; error: string; scopeHint?: string };

const MARKET_TAX_QUERY = `
  query KitchenOSMarketTaxProfile($marketId: ID!) {
    market(id: $marketId) {
      id
      name
      enabled
      currencySettings {
        baseCurrency {
          currencyCode
        }
      }
      regions(first: 50) {
        nodes {
          name
          ... on MarketRegionCountry {
            code
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

export function parseShopifyMarketTaxGraphQLResponse(json: unknown): ShopifyMarketTaxFetchResult {
  const data =
    json && typeof json === "object" ? (json as Record<string, unknown>).data : undefined;
  const market =
    data && typeof data === "object" ? (data as Record<string, unknown>).market : undefined;
  if (!market || typeof market !== "object") {
    return { ok: false, error: "Market not found in Shopify response." };
  }

  const marketRecord = market as Record<string, unknown>;
  const shopifyMarketId = typeof marketRecord.id === "string" ? marketRecord.id : "";
  if (!shopifyMarketId) return { ok: false, error: "Missing market id." };

  const regions =
    marketRecord.regions && typeof marketRecord.regions === "object"
      ? (marketRecord.regions as Record<string, unknown>).nodes
      : undefined;

  const regionCodes: string[] = [];
  if (Array.isArray(regions)) {
    for (const node of regions) {
      if (!node || typeof node !== "object") continue;
      const code = (node as Record<string, unknown>).code;
      if (typeof code === "string" && code.trim()) {
        regionCodes.push(code.trim().toUpperCase());
      }
    }
  }

  const currencySettings =
    marketRecord.currencySettings && typeof marketRecord.currencySettings === "object"
      ? (marketRecord.currencySettings as Record<string, unknown>)
      : null;
  const baseCurrency =
    currencySettings?.baseCurrency && typeof currencySettings.baseCurrency === "object"
      ? (currencySettings.baseCurrency as Record<string, unknown>)
      : null;
  const currencyCode =
    typeof baseCurrency?.currencyCode === "string" ? baseCurrency.currencyCode : null;

  const inferredMode = inferTaxModeFromRegionCodes(regionCodes);
  const preset = presetTaxSettings(inferredMode);
  const taxComponents = preset.components.map((c) => ({
    id: c.id,
    label: c.label,
    ratePercent: c.ratePercent,
  }));
  const totalRatePercent = taxComponents.reduce((sum, c) => sum + c.ratePercent, 0);
  const dutiesEnabled = regionCodes.length > 1 ? true : null;

  return {
    ok: true,
    shopifyMarketId,
    regionCodes: [...new Set(regionCodes)],
    currencyCode,
    taxIncludedInPrices: preset.taxIncludedInPrices ?? false,
    inferredMode,
    taxComponents,
    totalRatePercent,
    dutiesEnabled,
  };
}

export async function fetchShopifyMarketTaxProfile(
  creds: ShopifyCredentials,
  shopifyMarketId: string,
): Promise<ShopifyMarketTaxFetchResult> {
  const version = creds.apiVersion ?? "2025-01";
  try {
    const res = await fetch(adminEndpoint(creds.shopDomain, version), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": creds.adminAccessToken,
      },
      body: JSON.stringify({
        query: MARKET_TAX_QUERY,
        variables: { marketId: shopifyMarketId },
      }),
      cache: "no-store",
    });

    const json = (await res.json()) as {
      data?: unknown;
      errors?: Array<{ message?: string }>;
    };

    if (!res.ok) {
      return { ok: false, error: `Shopify Admin API HTTP ${res.status}` };
    }
    if (json.errors?.length) {
      const error = json.errors.map((e) => e.message).filter(Boolean).join("; ");
      return { ok: false, error: error || "Shopify GraphQL error" };
    }

    return parseShopifyMarketTaxGraphQLResponse(json);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export function listTaxGuardStorefrontMarkets(settingsCenterJson: unknown): StorefrontMarket[] {
  return parseStorefrontMarketsFromSettingsCenter(settingsCenterJson).filter((market) => {
    if (market.enabled === false || !market.shopifyMarketId?.trim()) return false;
    return market.syncMode === "import" || market.syncMode === "bidirectional";
  });
}

export async function importShopifyMarketTaxForConnection(input: {
  userId: string;
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
  skipUnchanged?: boolean;
}): Promise<
  | {
      ok: true;
      marketsImported: number;
      marketsUnchanged: number;
    }
  | { ok: false; error: string }
> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { settingsCenterJson: true },
  });

  const guardMarkets = listTaxGuardStorefrontMarkets(kitchen?.settingsCenterJson);
  if (guardMarkets.length === 0) {
    return { ok: false, error: "No OS Kitchen markets with tax guard enabled." };
  }

  const current = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  const now = new Date().toISOString();
  let marketsImported = 0;
  let marketsUnchanged = 0;
  const errors: string[] = [];
  const marketTaxImports: Record<string, ShopifyMarketTaxImportRow> = {
    ...current.marketTaxImports,
  };

  for (const market of guardMarkets) {
    const shopifyMarketId = market.shopifyMarketId!.trim();
    const fetched = await fetchShopifyMarketTaxProfile(input.creds, shopifyMarketId);
    if (!fetched.ok) {
      errors.push(`${market.name}: ${fetched.error}`);
      continue;
    }

    const taxHash = computeShopifyMarketTaxHash({
      regionCodes: fetched.regionCodes,
      taxIncludedInPrices: fetched.taxIncludedInPrices,
      totalRatePercent: fetched.totalRatePercent,
      dutiesEnabled: fetched.dutiesEnabled,
    });

    const previous = current.marketTaxImports[market.id];
    if (input.skipUnchanged && previous?.taxHash === taxHash) {
      marketsUnchanged += 1;
      continue;
    }

    marketTaxImports[market.id] = {
      osMarketId: market.id,
      shopifyMarketId: fetched.shopifyMarketId,
      importedAt: now,
      regionCodes: fetched.regionCodes,
      currencyCode: fetched.currencyCode,
      taxIncludedInPrices: fetched.taxIncludedInPrices,
      inferredMode: fetched.inferredMode,
      taxComponents: fetched.taxComponents,
      totalRatePercent: fetched.totalRatePercent,
      dutiesEnabled: fetched.dutiesEnabled,
      taxHash,
    };
    marketsImported += 1;
  }

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          lastTaxImportAt: now,
          taxImportError: errors.length > 0 ? errors.join(" · ") : null,
          marketTaxImports,
        }),
      ),
    },
  });

  if (marketsImported === 0 && marketsUnchanged === 0 && errors.length > 0) {
    return { ok: false, error: errors[0] ?? "Tax import failed." };
  }

  return { ok: true, marketsImported, marketsUnchanged };
}

export function loadKitchenosTaxSettingsForOwner(settingsCenterJson: unknown) {
  return parseTaxSettingsFromSettingsCenter(settingsCenterJson);
}

export function buildKitchenosTaxSummaryForGuard(settingsCenterJson: unknown): ReturnType<
  typeof summarizeKitchenosTaxSettings
> {
  const settings = loadKitchenosTaxSettingsForOwner(settingsCenterJson);
  if (!settings) {
    return summarizeKitchenosTaxSettings(presetTaxSettings("single"));
  }
  return summarizeKitchenosTaxSettings(settings);
}

export function shopifyMarketIdTail(gid: string): string {
  return gidTail(gid);
}
