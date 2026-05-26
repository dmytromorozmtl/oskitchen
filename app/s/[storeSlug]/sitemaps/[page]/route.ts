import { NextResponse } from "next/server";

import { chunkSitemapPaths, collectStorefrontSitemapPaths } from "@/lib/storefront/sitemap-urls";
import { buildSitemapUrlsetXml, sitemapResponseHeaders } from "@/lib/storefront/sitemap-xml";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";
import { resolvePublicStorefrontWithBrand } from "@/lib/storefront/public-storefront-brand";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ storeSlug: string; page: string }> },
) {
  const { storeSlug, page: pageRaw } = await params;
  const pageNum = Number(pageRaw);
  if (!Number.isFinite(pageNum) || pageNum < 1) {
    return new NextResponse("Not found", { status: 404 });
  }

  const sfRaw = await getStorefrontForPublicFromRequest(storeSlug);
  if (!sfRaw?.enabled || !sfRaw.published) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { sf, canonicalBase } = await resolvePublicStorefrontWithBrand(sfRaw, storeSlug);
  const base = canonicalBase.replace(/\/$/, "");
  const primaryLocale = (sf.locale ?? "en").split("-")[0] ?? "en";
  const allPaths = await collectStorefrontSitemapPaths(sf);
  const chunks = chunkSitemapPaths(allPaths);
  const chunk = chunks[pageNum - 1];
  if (!chunk) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = buildSitemapUrlsetXml({ base, pathSuffixes: chunk, primaryLocale });
  return new NextResponse(body, { headers: sitemapResponseHeaders(sf.id) });
}
