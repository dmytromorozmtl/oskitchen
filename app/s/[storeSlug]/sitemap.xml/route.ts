import { NextResponse } from "next/server";

import { chunkSitemapPaths, collectStorefrontSitemapPaths, SITEMAP_MAX_URLS_PER_FILE } from "@/lib/storefront/sitemap-urls";
import {
  buildSitemapIndexXml,
  buildSitemapUrlsetXml,
  sitemapResponseHeaders,
} from "@/lib/storefront/sitemap-xml";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";
import { resolvePublicStorefrontWithBrand } from "@/lib/storefront/public-storefront-brand";

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
  const base = canonicalBase.replace(/\/$/, "");
  const primaryLocale = (sf.locale ?? "en").split("-")[0] ?? "en";
  const allPaths = await collectStorefrontSitemapPaths(sf);
  const chunks = chunkSitemapPaths(allPaths);

  if (allPaths.length > SITEMAP_MAX_URLS_PER_FILE) {
    const body = buildSitemapIndexXml({ base, storeSlug, chunkCount: chunks.length });
    return new NextResponse(body, { headers: sitemapResponseHeaders(sf.id) });
  }

  const body = buildSitemapUrlsetXml({ base, pathSuffixes: allPaths, primaryLocale });
  return new NextResponse(body, { headers: sitemapResponseHeaders(sf.id) });
}
