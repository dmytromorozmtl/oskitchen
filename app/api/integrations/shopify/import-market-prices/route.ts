import { NextResponse } from "next/server";
import { z } from "zod";

import { allStorefrontCatalogTags } from "@/lib/storefront/cache-tags";
import { loadMarketsForStorefrontOwner } from "@/lib/storefront/market-resolve";
import { requireConnectionOwner } from "@/lib/integrations/api-helpers";
import { getShopifyCredentials } from "@/lib/integrations/decrypt-connection";
import { prisma } from "@/lib/prisma";
import { importShopifyMarketPricesForConnection } from "@/services/integrations/shopify-market-prices-service";
import { revalidatePath, revalidateTag } from "next/cache";

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
  const creds = getShopifyCredentials(owned.conn, settings?.apiVersion ?? undefined);
  if (!creds) {
    return NextResponse.json({ error: "Missing Shopify credentials" }, { status: 400 });
  }

  try {
    const result = await importShopifyMarketPricesForConnection({
      userId: owned.conn.userId,
      connection: owned.conn,
      creds,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

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

    revalidatePath("/dashboard/integrations/shopify");
    revalidatePath("/dashboard/storefront/markets");

    return NextResponse.json({
      ok: true,
      marketsImported: result.marketsImported,
      totalProductPrices: result.totalProductPrices,
      message: `Imported ${result.totalProductPrices} mapped product price(s) across ${result.marketsImported} market(s).`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
