import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireConnectionOwner } from "@/lib/integrations/api-helpers";
import { getShopifyCredentials } from "@/lib/integrations/decrypt-connection";
import { pushShopifyMarketPricesForConnection } from "@/services/integrations/shopify-market-prices-push-service";

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
    const result = await pushShopifyMarketPricesForConnection({
      userId: owned.conn.userId,
      connection: owned.conn,
      creds,
      origin: "manual",
      respectDebounce: false,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, skippedReason: result.skippedReason ?? null },
        { status: result.skippedReason === "debounced" ? 429 : 400 },
      );
    }

    revalidatePath("/dashboard/integrations/shopify");
    revalidatePath("/dashboard/storefront/markets");

    return NextResponse.json({
      ok: true,
      marketsPushed: result.marketsPushed,
      marketsUnchanged: result.marketsUnchanged,
      totalVariantsPushed: result.totalVariantsPushed,
      skippedReason: result.skippedReason ?? null,
      message:
        result.marketsPushed > 0
          ? `Pushed ${result.totalVariantsPushed} variant price(s) across ${result.marketsPushed} market(s).`
          : "No price changes detected for push-mode markets.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
