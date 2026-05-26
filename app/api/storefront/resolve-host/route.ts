import { NextResponse } from "next/server";

import { resolveStorefrontSlugFromHost } from "@/lib/storefront/resolve-storefront";
import { requireStorefrontMiddlewareSecret } from "@/lib/storefront/storefront-middleware-secret";

export const runtime = "nodejs";

/**
 * Internal helper for middleware: map Host header → `/s/[slug]` slug.
 * Secured with `STOREFRONT_MIDDLEWARE_SECRET` — not for browser use.
 */
export async function GET(request: Request) {
  const authError = requireStorefrontMiddlewareSecret(request);
  if (authError) {
    return authError;
  }
  const url = new URL(request.url);
  const host = url.searchParams.get("host");
  const res = await resolveStorefrontSlugFromHost(host);
  if (res.kind === "none") {
    return NextResponse.json({ slug: null, marketId: null });
  }
  const marketId = "marketId" in res && res.marketId ? res.marketId : null;
  const brandId = "brandId" in res && res.brandId ? res.brandId : null;
  let brandSlug: string | null = null;
  if (brandId) {
    const { prisma } = await import("@/lib/prisma");
    const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { slug: true } });
    brandSlug = brand?.slug ?? null;
  }
  return NextResponse.json({ slug: res.storeSlug, kind: res.kind, marketId, brandId, brandSlug });
}
