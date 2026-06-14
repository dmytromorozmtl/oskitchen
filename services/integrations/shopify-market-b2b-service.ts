import { createHash } from "node:crypto";

import {
  b2bCompanyNamesMatch,
  b2bEmailsMatch,
  isShopifyMarketsB2bGuardEnabled,
  normalizeB2bCompanyName,
  SHOPIFY_MARKETS_B2B_REQUIRED_SCOPES,
} from "@/lib/commercial/shopify-market-b2b-guard";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyB2bCompanyImportRow,
} from "@/lib/integrations/shopify-markets-settings";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import type { IntegrationConnection } from "@prisma/client";
import type { ShopifyCredentials } from "@/services/integrations/shopify";

export type ShopifyB2bCompanyNode = {
  shopifyCompanyId: string;
  name: string;
  externalId: string | null;
  mainContactEmail: string | null;
  locationCount: number;
  locationCountries: string[];
};

export type ShopifyB2bCompaniesFetchResult =
  | { ok: true; companies: ShopifyB2bCompanyNode[] }
  | { ok: false; error: string; scopeHint?: string; unavailable?: boolean };

const B2B_COMPANIES_QUERY = `
  query KitchenOSB2BCompanies($first: Int!) {
    companies(first: $first) {
      edges {
        node {
          id
          name
          externalId
          mainContact {
            customer {
              email
            }
          }
          locations(first: 25) {
            edges {
              node {
                id
                shippingAddress {
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

export function computeShopifyB2bCompanyHash(input: {
  name: string;
  externalId: string | null;
  mainContactEmail: string | null;
  locationCountries: string[];
}): string {
  const payload = [
    normalizeB2bCompanyName(input.name),
    input.externalId?.trim() ?? "",
    input.mainContactEmail?.trim().toLowerCase() ?? "",
    [...input.locationCountries].sort().join(","),
  ].join("|");
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

export function parseShopifyB2bCompaniesGraphQLResponse(json: unknown): ShopifyB2bCompaniesFetchResult {
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

  const companies: ShopifyB2bCompanyNode[] = [];

  for (const edge of edges) {
    if (!edge || typeof edge !== "object") continue;
    const node = (edge as Record<string, unknown>).node;
    if (!node || typeof node !== "object") continue;
    const record = node as Record<string, unknown>;
    const shopifyCompanyId = typeof record.id === "string" ? record.id : "";
    const name = typeof record.name === "string" ? record.name.trim() : "";
    if (!shopifyCompanyId || !name) continue;

    const externalId = typeof record.externalId === "string" ? record.externalId.trim() || null : null;

    let mainContactEmail: string | null = null;
    const mainContact =
      record.mainContact && typeof record.mainContact === "object"
        ? (record.mainContact as Record<string, unknown>)
        : null;
    const customer =
      mainContact?.customer && typeof mainContact.customer === "object"
        ? (mainContact.customer as Record<string, unknown>)
        : null;
    if (typeof customer?.email === "string" && customer.email.trim()) {
      mainContactEmail = customer.email.trim();
    }

    const locationCountries = new Set<string>();
    const locations =
      record.locations && typeof record.locations === "object"
        ? (record.locations as Record<string, unknown>).edges
        : undefined;
    let locationCount = 0;
    if (Array.isArray(locations)) {
      for (const locEdge of locations) {
        if (!locEdge || typeof locEdge !== "object") continue;
        const locNode = (locEdge as Record<string, unknown>).node;
        if (!locNode || typeof locNode !== "object") continue;
        locationCount += 1;
        const ship =
          (locNode as Record<string, unknown>).shippingAddress &&
          typeof (locNode as Record<string, unknown>).shippingAddress === "object"
            ? ((locNode as Record<string, unknown>).shippingAddress as Record<string, unknown>)
            : null;
        const country = typeof ship?.country === "string" ? ship.country.trim().toUpperCase() : "";
        if (country) locationCountries.add(country);
      }
    }

    companies.push({
      shopifyCompanyId,
      name,
      externalId,
      mainContactEmail,
      locationCount,
      locationCountries: [...locationCountries],
    });
  }

  return { ok: true, companies };
}

export async function fetchShopifyB2bCompanies(
  creds: ShopifyCredentials,
  first = 50,
): Promise<ShopifyB2bCompaniesFetchResult> {
  const version = creds.apiVersion ?? "2025-01";
  const res = await fetch(adminEndpoint(creds.shopDomain, version), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": creds.adminAccessToken,
    },
    body: JSON.stringify({ query: B2B_COMPANIES_QUERY, variables: { first } }),
    cache: "no-store",
  });

  const json = (await res.json()) as unknown;
  if (!res.ok) {
    return { ok: false, error: `HTTP ${res.status}`, unavailable: res.status === 403 };
  }
  return parseShopifyB2bCompaniesGraphQLResponse(json);
}

export function suggestCompanyAccountIdForShopifyCompany(input: {
  shopifyCompany: ShopifyB2bCompanyNode;
  companyAccounts: Array<{ id: string; name: string; billingEmail: string | null }>;
}): string | null {
  const byName = input.companyAccounts.find((row) =>
    b2bCompanyNamesMatch(row.name, input.shopifyCompany.name),
  );
  if (byName) return byName.id;

  if (input.shopifyCompany.mainContactEmail) {
    const byEmail = input.companyAccounts.find((row) =>
      b2bEmailsMatch(row.billingEmail, input.shopifyCompany.mainContactEmail),
    );
    if (byEmail) return byEmail.id;
  }

  return null;
}

export function buildB2bCompanyImportRow(input: {
  shopifyCompany: ShopifyB2bCompanyNode;
  suggestedCompanyAccountId: string | null;
  importedAt: string;
}): ShopifyB2bCompanyImportRow {
  return {
    shopifyCompanyId: input.shopifyCompany.shopifyCompanyId,
    name: input.shopifyCompany.name,
    externalId: input.shopifyCompany.externalId,
    mainContactEmail: input.shopifyCompany.mainContactEmail,
    locationCount: input.shopifyCompany.locationCount,
    locationCountries: input.shopifyCompany.locationCountries,
    suggestedCompanyAccountId: input.suggestedCompanyAccountId,
    importedAt: input.importedAt,
    companyHash: computeShopifyB2bCompanyHash({
      name: input.shopifyCompany.name,
      externalId: input.shopifyCompany.externalId,
      mainContactEmail: input.shopifyCompany.mainContactEmail,
      locationCountries: input.shopifyCompany.locationCountries,
    }),
  };
}

export function hasB2bGuardShopifyMarkets(): boolean {
  return isShopifyMarketsB2bGuardEnabled();
}

export async function importShopifyB2bCompaniesForConnection(input: {
  userId: string;
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
  skipUnchanged?: boolean;
}): Promise<
  | { ok: true; companiesImported: number; companiesUnchanged: number; companiesTotal: number }
  | { ok: false; error: string; unavailable?: boolean }
> {
  if (!isShopifyMarketsB2bGuardEnabled()) {
    return {
      ok: false,
      error: "Shopify Markets B2B guard is disabled (SHOPIFY_MARKETS_B2B_GUARD).",
    };
  }

  const fetchResult = await fetchShopifyB2bCompanies(input.creds);
  const now = new Date().toISOString();
  const current = parseShopifyMarketsSyncSettings(input.connection.settingsJson);

  if (!fetchResult.ok) {
    await prisma.integrationConnection.update({
      where: { id: input.connection.id },
      data: {
        settingsJson: toInputJsonValue(
          mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
            lastB2bImportAt: now,
            b2bImportError: fetchResult.error,
            b2bUnavailableReason: fetchResult.unavailable ? fetchResult.error : null,
          }),
        ),
      },
    });
    return { ok: false, error: fetchResult.error, unavailable: fetchResult.unavailable };
  }

  const companyAccounts = await prisma.companyAccount.findMany({
    where: { userId: input.userId },
    select: { id: true, name: true, billingEmail: true },
    orderBy: { name: "asc" },
  });

  let companiesImported = 0;
  let companiesUnchanged = 0;
  const b2bCompanyImports: Record<string, ShopifyB2bCompanyImportRow> = {
    ...current.b2bCompanyImports,
  };

  for (const shopifyCompany of fetchResult.companies) {
    const suggestedCompanyAccountId = suggestCompanyAccountIdForShopifyCompany({
      shopifyCompany,
      companyAccounts,
    });
    const row = buildB2bCompanyImportRow({
      shopifyCompany,
      suggestedCompanyAccountId,
      importedAt: now,
    });
    const previous = b2bCompanyImports[row.shopifyCompanyId];
    if (
      input.skipUnchanged &&
      previous?.companyHash === row.companyHash &&
      previous?.suggestedCompanyAccountId === row.suggestedCompanyAccountId
    ) {
      companiesUnchanged += 1;
      continue;
    }
    b2bCompanyImports[row.shopifyCompanyId] = row;
    companiesImported += 1;
  }

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          lastB2bImportAt: now,
          b2bImportError: null,
          b2bUnavailableReason: null,
          b2bCompanyImports,
        }),
      ),
    },
  });

  return {
    ok: true,
    companiesImported,
    companiesUnchanged,
    companiesTotal: fetchResult.companies.length,
  };
}
