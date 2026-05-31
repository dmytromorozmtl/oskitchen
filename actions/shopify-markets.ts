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
