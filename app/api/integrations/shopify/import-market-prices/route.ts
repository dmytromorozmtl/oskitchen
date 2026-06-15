import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireConnectionOwner } from "@/lib/integrations/api-helpers";
import { getShopifyCredentials } from "@/lib/integrations/decrypt-connection";
import { revalidateStorefrontCatalogForOwner } from "@/lib/storefront/revalidate-shopify-market-catalog";
import { importShopifyMarketPricesForConnection } from "@/services/integrations/shopify-market-prices-service";

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

    await revalidateStorefrontCatalogForOwner(owned.conn.userId);

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
