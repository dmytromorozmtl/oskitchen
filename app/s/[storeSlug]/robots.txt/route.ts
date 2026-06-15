import { NextResponse } from "next/server";

import { mergeCdnCacheTag, storefrontSitemapCacheTag } from "@/lib/storefront/cdn-cache";
import { resolvePublicStorefrontWithBrand } from "@/lib/storefront/public-storefront-brand";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";
import { readStorefrontBrandContext } from "@/lib/storefront/brand-cookie-server";
import { ROBOTS_TXT_CACHE_HEADERS, buildStorefrontRobotsTxt } from "@/lib/storefront/robots-txt";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ storeSlug: string }> },
) {
  const { storeSlug } = await params;
  const sfRaw = await getStorefrontForPublicFromRequest(storeSlug);
  if (!sfRaw?.enabled || !sfRaw.published) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { sf, canonicalBase } = await resolvePublicStorefrontWithBrand(sfRaw, storeSlug);
  const brandCtx = await readStorefrontBrandContext();
  const body = buildStorefrontRobotsTxt({
    canonicalBase,
    sf,
    brandSlug: brandCtx?.brandSlug ?? null,
  });

  const headers = mergeCdnCacheTag({ ...ROBOTS_TXT_CACHE_HEADERS }, storefrontSitemapCacheTag(sf.id));
  return new NextResponse(body, { headers });
}
