import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { requireConnectionOwner } from "@/lib/integrations/api-helpers";
import { getShopifyCredentials } from "@/lib/integrations/decrypt-connection";
import { upsertExternalProductRecord } from "@/lib/integrations/persist-external-product";
import { allStorefrontCatalogTags } from "@/lib/storefront/cache-tags";
import { loadMarketsForStorefrontOwner } from "@/lib/storefront/market-resolve";
import { prisma } from "@/lib/prisma";
import { IntegrationProvider, IntegrationStatus } from "@prisma/client";
import {
  fetchProductsGraphQL,
  normalizeShopifyProduct,
} from "@/services/integrations/shopify";
import { importShopifyMarketPricesForConnection } from "@/services/integrations/shopify-market-prices-service";
import { revalidateTag } from "next/cache";

const bodySchema = z.object({
  connectionId: z.string().uuid(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const owned = await requireConnectionOwner(parsed.data.connectionId);
  if ("error" in owned) return owned.error;

  const settings = owned.conn.settingsJson as { apiVersion?: string } | null;
  const creds = getShopifyCredentials(
    owned.conn,
    settings?.apiVersion ?? undefined,
  );
  if (!creds) {
    return NextResponse.json({ error: "Missing Shopify credentials" }, { status: 400 });
  }

  try {
    let imported = 0;
    const nodes = await fetchProductsGraphQL(creds, 50);
    for (const node of nodes) {
      const rows = normalizeShopifyProduct(node as Record<string, unknown>);
      for (const row of rows) {
        const priceDec =
          row.price != null ? new Prisma.Decimal(String(row.price)) : null;
        await upsertExternalProductRecord({
          userId: owned.conn.userId,
          connectionId: owned.conn.id,
          provider: IntegrationProvider.SHOPIFY,
          externalProductId: row.externalProductId,
          externalVariantId: row.externalVariantId,
          title: row.title,
          sku: row.sku,
          price: priceDec,
          image: row.image,
          rawPayloadJson: row.rawPayloadJson,
        });
        imported++;
      }
    }

    await prisma.integrationConnection.update({
      where: { id: owned.conn.id },
      data: {
        lastSyncAt: new Date(),
        lastError: null,
        status: IntegrationStatus.CONNECTED,
      },
    });

    let marketPricesImported = 0;
    let marketsImported = 0;
    const priceImport = await importShopifyMarketPricesForConnection({
      userId: owned.conn.userId,
      connection: owned.conn,
      creds,
    });
    if (priceImport.ok) {
      marketPricesImported = priceImport.totalProductPrices;
      marketsImported = priceImport.marketsImported;
      const sf = await prisma.storefrontSettings.findFirst({
        where: { userId: owned.conn.userId, enabled: true },
        select: { storeSlug: true },
      });
      if (sf?.storeSlug) {
        const markets = await loadMarketsForStorefrontOwner(owned.conn.userId);
        for (const tag of allStorefrontCatalogTags(
          sf.storeSlug,
          markets.map((m) => m.id),
        )) {
          revalidateTag(tag);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      imported,
      marketPricesImported,
      marketsImported,
      priceImportSkipped: !priceImport.ok ? priceImport.error : null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.integrationConnection.update({
      where: { id: owned.conn.id },
      data: {
        lastError: msg,
        status: IntegrationStatus.ERROR,
      },
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
