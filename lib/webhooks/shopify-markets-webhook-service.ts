import type { IntegrationConnection } from "@prisma/client";

import { getShopifyCredentials } from "@/lib/integrations/decrypt-connection";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import { toInputJsonValue } from "@/lib/prisma/json";
import { prisma } from "@/lib/prisma";
import {
  isShopifyMarketsWebhookDebounced,
  revalidateStorefrontCatalogForOwner,
} from "@/lib/storefront/revalidate-shopify-market-catalog";
import {
  hasBidirectionalShopifyMarkets,
  reconcileBidirectionalShopifyMarketsForConnection,
} from "@/services/integrations/shopify-markets-bidirectional-service";
import {
  hasCatalogSyncShopifyMarkets,
  reconcileBidirectionalShopifyMarketCatalogForConnection,
} from "@/services/integrations/shopify-markets-catalog-bidirectional-service";
import {
  importShopifyMarketCatalogForConnection,
  listCatalogImportableStorefrontMarkets,
} from "@/services/integrations/shopify-market-catalog-service";
import {
  importShopifyMarketPricesForConnection,
  listImportableStorefrontMarkets,
} from "@/services/integrations/shopify-market-prices-service";
import { listShopifyMarkets } from "@/services/integrations/shopify-markets-service";

export type ShopifyMarketsWebhookResult =
  | { status: "debounced" }
  | { status: "no_import_markets" }
  | { status: "unchanged"; marketsUnchanged: number }
  | {
      status: "imported";
      marketsImported: number;
      marketsUnchanged: number;
      totalProductPrices: number;
    }
  | { status: "failed"; error: string };

const MARKETS_WEBHOOK_TOPICS = new Set([
  "markets/create",
  "markets/update",
  "markets/delete",
  "products/update",
]);

export function isShopifyMarketsPriceWebhookTopic(topic: string): boolean {
  return MARKETS_WEBHOOK_TOPICS.has(topic);
}

export async function handleShopifyMarketsWebhookEvent(input: {
  userId: string;
  connection: IntegrationConnection;
  topic: string;
}): Promise<ShopifyMarketsWebhookResult> {
  if (!isShopifyMarketsPriceWebhookTopic(input.topic)) {
    return { status: "no_import_markets" };
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { settingsCenterJson: true },
  });
  const importable = listImportableStorefrontMarkets(kitchen?.settingsCenterJson);
  const catalogImportable = listCatalogImportableStorefrontMarkets(kitchen?.settingsCenterJson);
  const bidirectional = hasBidirectionalShopifyMarkets(kitchen?.settingsCenterJson);
  const catalogSync = hasCatalogSyncShopifyMarkets(kitchen?.settingsCenterJson);
  if (importable.length === 0 && !bidirectional && catalogImportable.length === 0 && !catalogSync) {
    return { status: "no_import_markets" };
  }

  const sync = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  const now = new Date().toISOString();

  if (isShopifyMarketsWebhookDebounced(sync.lastWebhookPriceImportTriggeredAt)) {
    await prisma.integrationConnection.update({
      where: { id: input.connection.id },
      data: {
        settingsJson: toInputJsonValue(
          mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
            lastWebhookPriceImportSkippedReason: "debounced",
          }),
        ),
      },
    });
    return { status: "debounced" };
  }

  const creds = getShopifyCredentials(input.connection);
  if (!creds) {
    return { status: "failed", error: "Missing Shopify credentials." };
  }

  let settingsPatch = mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
    lastWebhookPriceImportTriggeredAt: now,
    lastWebhookPriceImportTopic: input.topic,
    lastWebhookPriceImportSkippedReason: null,
  });

  if (input.topic === "markets/create" || input.topic === "markets/update") {
    const discovery = await listShopifyMarkets(creds);
    if (discovery.ok) {
      settingsPatch = mergeShopifyMarketsSyncSettings(settingsPatch, {
        lastDiscoveryAt: now,
        discoveredMarkets: discovery.markets,
        primaryShopifyMarketId: discovery.primaryMarketId,
        discoveryError: null,
      });
    }
  }

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: { settingsJson: toInputJsonValue(settingsPatch) },
  });

  const refreshedConn = await prisma.integrationConnection.findUnique({
    where: { id: input.connection.id },
  });
  if (!refreshedConn) {
    return { status: "failed", error: "Connection not found after refresh." };
  }

  if (bidirectional) {
    const reconcileResult = await reconcileBidirectionalShopifyMarketsForConnection({
      userId: input.userId,
      connection: refreshedConn,
      creds,
      origin: "webhook",
      skipUnchanged: true,
    });

    if (!reconcileResult.ok) {
      await prisma.integrationConnection.update({
        where: { id: input.connection.id },
        data: {
          settingsJson: toInputJsonValue(
            mergeShopifyMarketsSyncSettings(refreshedConn.settingsJson, {
              lastWebhookPriceImportAt: now,
              lastBidirectionalReconcileError: reconcileResult.error,
            }),
          ),
        },
      });
      return { status: "failed", error: reconcileResult.error };
    }

    await prisma.integrationConnection.update({
      where: { id: input.connection.id },
      data: {
        settingsJson: toInputJsonValue(
          mergeShopifyMarketsSyncSettings(refreshedConn.settingsJson, {
            lastWebhookPriceImportAt: now,
            lastWebhookPriceImportTopic: input.topic,
            lastBidirectionalReconcileAt: now,
            lastBidirectionalReconcileError: null,
            lastBidirectionalReconcileResult: reconcileResult.conflictsOpen
              ? `open_conflicts=${reconcileResult.conflictsOpen}`
              : "synced",
          }),
        ),
      },
    });

    if (reconcileResult.importedMarkets === 0 && reconcileResult.pushedProducts === 0) {
      if (catalogSync) {
        await reconcileBidirectionalShopifyMarketCatalogForConnection({
          userId: input.userId,
          connection: refreshedConn,
          creds,
          origin: "webhook",
          skipUnchanged: true,
        });
      }
      return {
        status: "unchanged",
        marketsUnchanged: reconcileResult.marketsReconciled,
      };
    }

    if (catalogSync) {
      await reconcileBidirectionalShopifyMarketCatalogForConnection({
        userId: input.userId,
        connection: refreshedConn,
        creds,
        origin: "webhook",
        skipUnchanged: true,
      });
    }

    return {
      status: "imported",
      marketsImported: reconcileResult.importedMarkets,
      marketsUnchanged: 0,
      totalProductPrices: reconcileResult.conflictsDetected,
    };
  }

  const importResult = await importShopifyMarketPricesForConnection({
    userId: input.userId,
    connection: refreshedConn,
    creds,
    skipUnchanged: true,
  });

  if (!importResult.ok) {
    await prisma.integrationConnection.update({
      where: { id: input.connection.id },
      data: {
        settingsJson: toInputJsonValue(
          mergeShopifyMarketsSyncSettings(refreshedConn.settingsJson, {
            lastWebhookPriceImportAt: now,
            priceImportError: importResult.error,
          }),
        ),
      },
    });
    return { status: "failed", error: importResult.error };
  }

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(refreshedConn.settingsJson, {
          lastWebhookPriceImportAt: now,
          lastWebhookPriceImportTopic: input.topic,
          lastWebhookPriceImportSkippedReason:
            importResult.marketsImported === 0 && importResult.marketsUnchanged > 0
              ? "unchanged"
              : null,
        }),
      ),
    },
  });

  if (importResult.marketsImported > 0) {
    await revalidateStorefrontCatalogForOwner(input.userId);
  }

  if (catalogImportable.length > 0) {
    await importShopifyMarketCatalogForConnection({
      userId: input.userId,
      connection: refreshedConn,
      creds,
      skipUnchanged: true,
    });
  }

  if (importResult.marketsImported === 0 && importResult.marketsUnchanged > 0) {
    return {
      status: "unchanged",
      marketsUnchanged: importResult.marketsUnchanged,
    };
  }

  return {
    status: "imported",
    marketsImported: importResult.marketsImported,
    marketsUnchanged: importResult.marketsUnchanged,
    totalProductPrices: importResult.totalProductPrices,
  };
}
