"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  mergeShopifyMarketsSyncSettings,
  SHOPIFY_MARKETS_REQUIRED_SCOPES,
} from "@/lib/integrations/shopify-markets-settings";
import { getShopifyCredentials } from "@/lib/integrations/decrypt-connection";
import { requireIntegrationsActor } from "@/lib/integrations/require-integrations-actor";
import { integrationConnectionByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import { listShopifyMarkets } from "@/services/integrations/shopify-markets-service";
import {
  importShopifyMarketPricesForConnection,
} from "@/services/integrations/shopify-market-prices-service";
import {
  pushShopifyMarketPricesForConnection,
} from "@/services/integrations/shopify-market-prices-push-service";
import {
  reconcileBidirectionalShopifyMarketsForConnection,
  resolveShopifyMarketPriceConflict,
} from "@/services/integrations/shopify-markets-bidirectional-service";
import {
  reconcileBidirectionalShopifyMarketCatalogForConnection,
  resolveShopifyMarketCatalogConflict,
} from "@/services/integrations/shopify-markets-catalog-bidirectional-service";
import { importShopifyMarketCatalogForConnection } from "@/services/integrations/shopify-market-catalog-service";
import { pushShopifyMarketCatalogForConnection } from "@/services/integrations/shopify-market-catalog-push-service";
import { importShopifyMarketTaxForConnection } from "@/services/integrations/shopify-market-tax-service";
import {
  reconcileShopifyMarketTaxGuardForConnection,
  resolveShopifyMarketTaxConflict,
} from "@/services/integrations/shopify-markets-tax-guard-bidirectional-service";
import {
  applySuggestedShopifyMarketHostname,
  reconcileShopifyMarketHostnameGuardForConnection,
  resolveShopifyMarketHostnameConflict,
} from "@/services/integrations/shopify-markets-hostname-guard-bidirectional-service";
import { importShopifyMarketHostnameForConnection } from "@/services/integrations/shopify-market-hostname-service";
import { importShopifyB2bCompaniesForConnection } from "@/services/integrations/shopify-market-b2b-service";
import {
  reconcileShopifyB2bGuardForConnection,
  resolveShopifyB2bCompanyConflict,
} from "@/services/integrations/shopify-markets-b2b-guard-bidirectional-service";
import { importShopifyB2bLocationsForConnection } from "@/services/integrations/shopify-market-b2b-location-service";
import {
  reconcileShopifyB2bLocationRoutingForConnection,
  resolveShopifyB2bLocationConflict,
} from "@/services/integrations/shopify-markets-b2b-location-routing-service";
import {
  registerMissingShopifyMarketsWebhooks,
  syncShopifyMarketsWebhookRegistryForConnection,
} from "@/services/integrations/shopify-markets-webhook-registry-service";
import { runFullShopifyMarketsReconcileForConnection } from "@/services/integrations/shopify-markets-health-service";
import { revalidateStorefrontCatalogForOwner } from "@/lib/storefront/revalidate-shopify-market-catalog";

const discoverSchema = z.object({
  connectionId: z.string().uuid(),
});

async function resolvePrimaryStoreSlugForOwner(userId: string): Promise<string | null> {
  const sf = await prisma.storefrontSettings.findFirst({
    where: { userId, enabled: true },
    orderBy: { updatedAt: "desc" },
    select: { storeSlug: true },
  });
  return sf?.storeSlug?.trim() || null;
}

export async function discoverShopifyMarketsAction(connectionId: string) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.discover" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before discovery." };
  }

  const discovery = await listShopifyMarkets(creds);
  const now = new Date().toISOString();

  const settings = mergeShopifyMarketsSyncSettings(conn.settingsJson, {
    lastDiscoveryAt: now,
    discoveredMarkets: discovery.ok ? discovery.markets : [],
    primaryShopifyMarketId: discovery.ok ? discovery.primaryMarketId : null,
    discoveryError: discovery.ok ? null : discovery.error,
    requiredScopesNote: discovery.ok
      ? `Requires ${SHOPIFY_MARKETS_REQUIRED_SCOPES.join(", ")} on custom app.`
      : discovery.scopeHint
        ? `Missing Shopify scope: ${discovery.scopeHint}`
        : null,
  });

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: { settingsJson: toInputJsonValue(settings) },
  });

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");

  if (!discovery.ok) {
    return { ok: false as const, error: discovery.error };
  }

  const refreshedConn = await prisma.integrationConnection.findUnique({ where: { id: conn.id } });
  if (refreshedConn && creds) {
    await syncShopifyMarketsWebhookRegistryForConnection({
      connection: refreshedConn,
      creds,
    });
  }

  return {
    ok: true as const,
    markets: discovery.markets,
    primaryMarketId: discovery.primaryMarketId,
    discoveredAt: now,
  };
}

export async function importShopifyMarketPricesAction(connectionId: string) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.import_prices" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before import." };
  }

  const result = await importShopifyMarketPricesForConnection({
    userId: access.actor.userId,
    connection: conn,
    creds,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  await revalidateStorefrontCatalogForOwner(access.actor.userId);

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");

  return {
    ok: true as const,
    marketsImported: result.marketsImported,
    totalProductPrices: result.totalProductPrices,
  };
}

export async function pushShopifyMarketPricesAction(connectionId: string) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.push_prices" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before push." };
  }

  const result = await pushShopifyMarketPricesForConnection({
    userId: access.actor.userId,
    connection: conn,
    creds,
    origin: "manual",
    respectDebounce: false,
  });

  if (!result.ok) {
    return {
      ok: false as const,
      error: result.error,
      skippedReason: result.skippedReason,
    };
  }

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");

  return {
    ok: true as const,
    marketsPushed: result.marketsPushed,
    marketsUnchanged: result.marketsUnchanged,
    totalVariantsPushed: result.totalVariantsPushed,
    skippedReason: result.skippedReason,
  };
}

export async function reconcileBidirectionalShopifyMarketsAction(connectionId: string) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.reconcile_bidirectional" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before reconcile." };
  }

  const result = await reconcileBidirectionalShopifyMarketsForConnection({
    userId: access.actor.userId,
    connection: conn,
    creds,
    origin: "manual",
    skipUnchanged: false,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");

  return result;
}

export async function resolveShopifyMarketPriceConflictAction(input: {
  connectionId: string;
  conflictKey: string;
  resolution: "shopify" | "kitchenos" | "ignore";
}) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.resolve_conflict" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId: input.connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, input.connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials." };
  }

  const result = await resolveShopifyMarketPriceConflict({
    userId: access.actor.userId,
    connection: conn,
    creds,
    conflictKey: input.conflictKey,
    resolution: input.resolution,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");
  return { ok: true as const };
}

export async function importShopifyMarketCatalogAction(connectionId: string) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.import_catalog" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before import." };
  }

  const result = await importShopifyMarketCatalogForConnection({
    userId: access.actor.userId,
    connection: conn,
    creds,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  await revalidateStorefrontCatalogForOwner(access.actor.userId);
  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");

  return {
    ok: true as const,
    marketsImported: result.marketsImported,
    totalProducts: result.totalProducts,
  };
}

export async function pushShopifyMarketCatalogAction(connectionId: string) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.push_catalog" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before push." };
  }

  const result = await pushShopifyMarketCatalogForConnection({
    userId: access.actor.userId,
    connection: conn,
    creds,
    respectDebounce: false,
  });

  if (!result.ok) {
    return {
      ok: false as const,
      error: result.error,
      skippedReason: result.skippedReason,
    };
  }

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");

  return {
    ok: true as const,
    marketsPushed: result.marketsPushed,
    publishedCount: result.publishedCount,
    unpublishedCount: result.unpublishedCount,
    skippedReason: result.skippedReason,
  };
}

export async function reconcileBidirectionalShopifyMarketCatalogAction(connectionId: string) {
  const access = await requireIntegrationsActor({
    operation: "shopify.markets.reconcile_catalog_bidirectional",
  });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before reconcile." };
  }

  const result = await reconcileBidirectionalShopifyMarketCatalogForConnection({
    userId: access.actor.userId,
    connection: conn,
    creds,
    origin: "manual",
    skipUnchanged: false,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");

  return result;
}

export async function resolveShopifyMarketCatalogConflictAction(input: {
  connectionId: string;
  conflictKey: string;
  resolution: "shopify" | "kitchenos" | "ignore";
}) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.resolve_catalog_conflict" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId: input.connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, input.connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials." };
  }

  const result = await resolveShopifyMarketCatalogConflict({
    userId: access.actor.userId,
    connection: conn,
    creds,
    conflictKey: input.conflictKey,
    resolution: input.resolution,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");
  return { ok: true as const };
}

export async function importShopifyMarketTaxAction(connectionId: string) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.import_tax" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before import." };
  }

  const result = await importShopifyMarketTaxForConnection({
    userId: access.actor.userId,
    connection: conn,
    creds,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");

  return {
    ok: true as const,
    marketsImported: result.marketsImported,
    marketsUnchanged: result.marketsUnchanged,
  };
}

export async function reconcileShopifyMarketTaxGuardAction(connectionId: string) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.reconcile_tax_guard" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before reconcile." };
  }

  const result = await reconcileShopifyMarketTaxGuardForConnection({
    userId: access.actor.userId,
    connection: conn,
    creds,
    origin: "manual",
    skipUnchanged: false,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");

  return result;
}

export async function resolveShopifyMarketTaxConflictAction(input: {
  connectionId: string;
  conflictKey: string;
  resolution: "shopify" | "kitchenos" | "ignore";
}) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.resolve_tax_conflict" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId: input.connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, input.connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const result = await resolveShopifyMarketTaxConflict({
    connection: conn,
    conflictKey: input.conflictKey,
    resolution: input.resolution,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");
  return { ok: true as const };
}

export async function importShopifyMarketHostnameAction(connectionId: string) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.import_hostname" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const primaryStoreSlug = await resolvePrimaryStoreSlugForOwner(access.actor.userId);
  if (!primaryStoreSlug) {
    return { ok: false as const, error: "Publish storefront overview with a slug first." };
  }

  const result = await importShopifyMarketHostnameForConnection({
    userId: access.actor.userId,
    connection: conn,
    primaryStoreSlug,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");

  return {
    ok: true as const,
    marketsImported: result.marketsImported,
    marketsUnchanged: result.marketsUnchanged,
  };
}

export async function reconcileShopifyMarketHostnameGuardAction(connectionId: string) {
  const access = await requireIntegrationsActor({
    operation: "shopify.markets.reconcile_hostname_guard",
  });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const primaryStoreSlug = await resolvePrimaryStoreSlugForOwner(access.actor.userId);
  if (!primaryStoreSlug) {
    return { ok: false as const, error: "Publish storefront overview with a slug first." };
  }

  const result = await reconcileShopifyMarketHostnameGuardForConnection({
    userId: access.actor.userId,
    connection: conn,
    primaryStoreSlug,
    origin: "manual",
    skipUnchanged: false,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");

  return result;
}

export async function resolveShopifyMarketHostnameConflictAction(input: {
  connectionId: string;
  conflictKey: string;
  resolution: "shopify" | "kitchenos" | "ignore";
}) {
  const access = await requireIntegrationsActor({
    operation: "shopify.markets.resolve_hostname_conflict",
  });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId: input.connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, input.connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const primaryStoreSlug = await resolvePrimaryStoreSlugForOwner(access.actor.userId);
  if (!primaryStoreSlug) {
    return { ok: false as const, error: "Publish storefront overview with a slug first." };
  }

  const result = await resolveShopifyMarketHostnameConflict({
    userId: access.actor.userId,
    connection: conn,
    primaryStoreSlug,
    conflictKey: input.conflictKey,
    resolution: input.resolution,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");
  return { ok: true as const, applied: result.applied };
}

export async function applySuggestedShopifyMarketHostnameAction(input: {
  connectionId: string;
  osMarketId: string;
}) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.apply_hostname" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId: input.connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, input.connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const primaryStoreSlug = await resolvePrimaryStoreSlugForOwner(access.actor.userId);
  if (!primaryStoreSlug) {
    return { ok: false as const, error: "Publish storefront overview with a slug first." };
  }

  const result = await applySuggestedShopifyMarketHostname({
    userId: access.actor.userId,
    connection: conn,
    osMarketId: input.osMarketId,
    primaryStoreSlug,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");
  revalidatePath("/dashboard/storefront/domains");
  return { ok: true as const };
}

export async function importShopifyB2bCompaniesAction(connectionId: string) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.import_b2b" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before import." };
  }

  const result = await importShopifyB2bCompaniesForConnection({
    userId: access.actor.userId,
    connection: conn,
    creds,
  });

  if (!result.ok) return { ok: false as const, error: result.error, unavailable: result.unavailable };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");
  revalidatePath("/dashboard/customers/companies");

  return {
    ok: true as const,
    companiesImported: result.companiesImported,
    companiesUnchanged: result.companiesUnchanged,
    companiesTotal: result.companiesTotal,
  };
}

export async function reconcileShopifyB2bGuardAction(connectionId: string) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.reconcile_b2b_guard" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before reconcile." };
  }

  const result = await reconcileShopifyB2bGuardForConnection({
    userId: access.actor.userId,
    connection: conn,
    creds,
    origin: "manual",
    skipUnchanged: false,
  });

  if (!result.ok) return { ok: false as const, error: result.error, unavailable: result.unavailable };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");
  revalidatePath("/dashboard/customers/companies");

  return result;
}

export async function resolveShopifyB2bCompanyConflictAction(input: {
  connectionId: string;
  conflictKey: string;
  resolution: "shopify" | "kitchenos" | "ignore";
  companyAccountId?: string;
}) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.resolve_b2b_conflict" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId: input.connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, input.connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const result = await resolveShopifyB2bCompanyConflict({
    userId: access.actor.userId,
    connection: conn,
    conflictKey: input.conflictKey,
    resolution: input.resolution,
    companyAccountId: input.companyAccountId,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");
  revalidatePath("/dashboard/customers/companies");
  return { ok: true as const, linked: result.linked, applied: result.applied };
}

export async function importShopifyB2bLocationsAction(connectionId: string) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.import_b2b_locations" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before import." };
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: access.actor.userId },
    select: { settingsCenterJson: true },
  });

  const result = await importShopifyB2bLocationsForConnection({
    userId: access.actor.userId,
    connection: conn,
    creds,
    settingsCenterJson: kitchen?.settingsCenterJson,
  });

  if (!result.ok) return { ok: false as const, error: result.error, unavailable: result.unavailable };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");
  revalidatePath("/dashboard/customers/companies");

  return {
    ok: true as const,
    locationsImported: result.locationsImported,
    locationsUnchanged: result.locationsUnchanged,
    locationsTotal: result.locationsTotal,
  };
}

export async function reconcileShopifyB2bLocationRoutingAction(connectionId: string) {
  const access = await requireIntegrationsActor({
    operation: "shopify.markets.reconcile_b2b_location_routing",
  });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before reconcile." };
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: access.actor.userId },
    select: { settingsCenterJson: true },
  });

  const result = await reconcileShopifyB2bLocationRoutingForConnection({
    userId: access.actor.userId,
    connection: conn,
    creds,
    settingsCenterJson: kitchen?.settingsCenterJson,
    origin: "manual",
    skipUnchanged: false,
  });

  if (!result.ok) return { ok: false as const, error: result.error, unavailable: result.unavailable };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");
  revalidatePath("/dashboard/customers/companies");

  return result;
}

export async function resolveShopifyB2bLocationConflictAction(input: {
  connectionId: string;
  conflictKey: string;
  resolution: "shopify" | "kitchenos" | "ignore";
  osMarketId?: string;
  companyAccountId?: string;
}) {
  const access = await requireIntegrationsActor({
    operation: "shopify.markets.resolve_b2b_location_conflict",
  });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId: input.connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, input.connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const result = await resolveShopifyB2bLocationConflict({
    connection: conn,
    conflictKey: input.conflictKey,
    resolution: input.resolution,
    osMarketId: input.osMarketId,
    companyAccountId: input.companyAccountId,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");
  revalidatePath("/dashboard/customers/companies");
  return { ok: true as const, linked: result.linked };
}

export async function syncShopifyMarketsWebhookRegistryAction(connectionId: string) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.sync_webhook_registry" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before sync." };
  }

  const result = await syncShopifyMarketsWebhookRegistryForConnection({ connection: conn, creds });
  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/shopify");
  return { ok: true as const, driftOpen: result.driftOpen };
}

export async function registerShopifyMarketsWebhooksAction(connectionId: string) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.register_webhooks" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before register." };
  }

  const result = await registerMissingShopifyMarketsWebhooks({ connection: conn, creds });
  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/shopify");
  return {
    ok: true as const,
    registered: result.registered,
    skipped: result.skipped,
    errors: result.errors,
  };
}

export async function runFullShopifyMarketsReconcileAction(connectionId: string) {
  const access = await requireIntegrationsActor({ operation: "shopify.markets.full_reconcile" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const parsed = discoverSchema.safeParse({ connectionId });
  if (!parsed.success) return { ok: false as const, error: "Invalid connection." };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
  });
  if (!conn) return { ok: false as const, error: "Shopify connection not found." };

  const creds = getShopifyCredentials(conn);
  if (!creds) {
    return { ok: false as const, error: "Complete Shopify Admin API credentials before reconcile." };
  }

  const primaryStoreSlug = await resolvePrimaryStoreSlugForOwner(access.actor.userId);
  if (!primaryStoreSlug) {
    return { ok: false as const, error: "Publish storefront overview with a slug first." };
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: access.actor.userId },
    select: { settingsCenterJson: true },
  });

  const result = await runFullShopifyMarketsReconcileForConnection({
    userId: access.actor.userId,
    connection: conn,
    creds,
    primaryStoreSlug,
    settingsCenterJson: kitchen?.settingsCenterJson,
  });

  if (!result.ok) {
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: {
        settingsJson: toInputJsonValue(
          mergeShopifyMarketsSyncSettings(conn.settingsJson, {
            lastFullMarketsReconcileAt: new Date().toISOString(),
            lastFullMarketsReconcileError: result.error,
          }),
        ),
      },
    });
    return { ok: false as const, error: result.error, steps: result.steps };
  }

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/storefront/markets");
  revalidatePath("/dashboard/storefront/domains");
  revalidatePath("/dashboard/customers/companies");

  return {
    ok: true as const,
    steps: result.steps,
    overallScore: result.snapshot.overallScore,
    overallLevel: result.snapshot.overallLevel,
  };
}
