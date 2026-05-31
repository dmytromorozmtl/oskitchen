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
import { revalidateStorefrontCatalogForOwner } from "@/lib/storefront/revalidate-shopify-market-catalog";

const discoverSchema = z.object({
  connectionId: z.string().uuid(),
});

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

  return { ok: true as const, ...result };
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

  return { ok: true as const, ...result };
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

  return { ok: true as const, ...result };
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
