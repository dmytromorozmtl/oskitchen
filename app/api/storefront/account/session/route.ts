import { NextResponse } from "next/server";

import { getStorefrontCustomerSession } from "@/lib/storefront/storefront-customer-session";
import { enforceStorefrontRouteRateLimit } from "@/lib/storefront/storefront-rate-limit";
import { listStorefrontOrdersForCustomer } from "@/services/storefront/storefront-customer-service";

/** Returns orders for the signed-in Supabase user on this storefront. */
export async function GET(request: Request) {
  const storeSlugEarly = new URL(request.url).searchParams.get("storeSlug")?.trim();
  const rate = await enforceStorefrontRouteRateLimit(request, "account/session", storeSlugEarly);
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const storeSlug = storeSlugEarly;
  if (!storeSlug) {
    return NextResponse.json({ error: "storeSlug required." }, { status: 400 });
  }

  const session = await getStorefrontCustomerSession(storeSlug);
  if (!session) {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
  }

  const orders = await listStorefrontOrdersForCustomer({
    storefrontId: session.storefrontId,
    email: session.email,
    supabaseUserId: session.supabaseUserId,
  });

  return NextResponse.json({
    ok: true,
    authenticated: true,
    email: session.email,
    orders: orders.map((o) => ({
      token: o.publicToken,
      orderNumber: o.orderNumber,
      total: Number(o.total),
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      href: `/s/${storeSlug}/order/${o.publicToken}`,
    })),
  });
}
