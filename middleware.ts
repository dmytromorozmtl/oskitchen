import { type NextRequest, NextResponse } from "next/server";

import {
  brandCookieOptions,
  clearBrandCookiesOnResponse,
  isValidBrandId,
  KOS_BRAND_ID_HEADER,
  KOS_BRAND_SLUG_HEADER,
} from "@/lib/storefront/brand-cookie";
import { STOREFRONT_MARKET_COOKIE, storefrontCatalogTag } from "@/lib/storefront/cache-tags";
import { storefrontSlugCacheTag } from "@/lib/storefront/cdn-cache";
import { guessVanityHostFromLabel } from "@/lib/storefront/resolve-vanity-host";
import { isStorefrontExperimentsEnabled } from "@/lib/storefront/storefront-experiments-enabled";
import { applyThemeExperimentEdgeMiddleware } from "@/lib/storefront/theme-experiment-middleware";
import { stripLocalePrefixFromInternalPath } from "@/lib/storefront/locale-path";
import { parseStorefrontInternalPath } from "@/lib/storefront/storefront-redirects";
import { mapVanityPathToInternal } from "@/lib/storefront/middleware-paths";
import { enforceApiSessionMiddleware } from "@/lib/api/middleware-api-auth";
import { updateSession } from "@/lib/supabase/middleware";

async function fetchHostResolution(
  request: NextRequest,
  hostNoPort: string,
): Promise<{ slug: string | null; marketId: string | null; brandId: string | null; brandSlug: string | null }> {
  const secret = process.env.STOREFRONT_MIDDLEWARE_SECRET;
  if (!secret) return { slug: null, marketId: null, brandId: null, brandSlug: null };
  try {
    const u = new URL("/api/storefront/resolve-host", request.nextUrl.origin);
    u.searchParams.set("host", hostNoPort);
    const r = await fetch(u.toString(), {
      headers: { "x-kos-mw-secret": secret },
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (!r.ok) return { slug: null, marketId: null, brandId: null, brandSlug: null };
    const j = (await r.json()) as {
      slug?: string | null;
      marketId?: string | null;
      brandId?: string | null;
      brandSlug?: string | null;
    };
    const slug = typeof j.slug === "string" && j.slug.length > 0 ? j.slug : null;
    const marketId = typeof j.marketId === "string" && j.marketId.length > 0 ? j.marketId : null;
    const brandId = typeof j.brandId === "string" && j.brandId.length > 0 ? j.brandId : null;
    const brandSlug = typeof j.brandSlug === "string" && j.brandSlug.length > 0 ? j.brandSlug : null;
    return { slug, marketId, brandId, brandSlug };
  } catch {
    return { slug: null, marketId: null, brandId: null, brandSlug: null };
  }
}

function applyBrandContext(res: NextResponse, brandId: string | null, brandSlug: string | null) {
  if (!brandId) {
    for (const c of clearBrandCookiesOnResponse()) {
      res.cookies.set(c.name, c.value, { path: c.path, maxAge: c.maxAge });
    }
    res.headers.delete(KOS_BRAND_ID_HEADER);
    res.headers.delete(KOS_BRAND_SLUG_HEADER);
    return res;
  }
  res.headers.set(KOS_BRAND_ID_HEADER, brandId);
  if (brandSlug) res.headers.set(KOS_BRAND_SLUG_HEADER, brandSlug);
  else res.headers.delete(KOS_BRAND_SLUG_HEADER);
  for (const c of brandCookieOptions(brandId, brandSlug)) {
    res.cookies.set(c.name, c.value, {
      httpOnly: c.httpOnly,
      sameSite: c.sameSite,
      secure: c.secure,
      path: c.path,
      maxAge: c.maxAge,
    });
  }
  return res;
}

function mergeCookies(from: NextResponse, to: NextResponse) {
  for (const c of from.cookies.getAll()) {
    to.cookies.set(c.name, c.value);
  }
}

/** Lets server layouts detect checkout vs marketing pages without client hooks. */
function stampKosPathname(res: NextResponse, pathname: string) {
  res.headers.set("x-kos-pathname", pathname);
  return res;
}

/** Lets server layouts read `?preview=1` without searchParams in layout. */
function stampKosStorefrontPreview(res: NextResponse, request: NextRequest) {
  const preview = request.nextUrl.searchParams.get("preview");
  if (preview === "1" || preview === "true") {
    res.headers.set("x-kos-storefront-preview", "1");
  }
  return res;
}

async function withThemeExperiment(
  request: NextRequest,
  response: NextResponse,
  internalPath: string,
): Promise<NextResponse> {
  if (!isStorefrontExperimentsEnabled()) return response;
  return applyThemeExperimentEdgeMiddleware(request, response, internalPath);
}

function stampStorefrontCdnTags(res: NextResponse, pathname: string, marketId?: string | null) {
  const slugMatch = pathname.match(/^\/s\/([^/]+)/);
  if (!slugMatch?.[1]) return res;
  const slug = slugMatch[1];
  const tags = [storefrontSlugCacheTag(slug), storefrontCatalogTag(slug)];
  if (marketId) tags.push(storefrontCatalogTag(slug, marketId));
  if (pathname.includes("sitemap") || pathname.endsWith("sitemap.xml") || pathname.endsWith("robots.txt")) {
    tags.push(`${storefrontSlugCacheTag(slug)}-sitemap`);
  }
  res.headers.append("CDN-Cache-Tag", tags.join(", "));
  return res;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const apiAuthBlock = await enforceApiSessionMiddleware(request);
  if (apiAuthBlock) return apiAuthBlock;

  const hostRaw =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    "";
  const hostNoPort = hostRaw.split(":")[0]?.toLowerCase() ?? "";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let appHostname = "localhost";
  try {
    appHostname = new URL(appUrl).hostname.toLowerCase();
  } catch {
    /* ignore */
  }

  const sessionResponse = await updateSession(request);

  if (pathname.startsWith("/s/")) {
    const { rewritten, locale } = stripLocalePrefixFromInternalPath(pathname);
    if (locale && rewritten !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = rewritten;
      const rewrite = stampStorefrontCdnTags(stampKosPathname(NextResponse.rewrite(url), rewritten), rewritten);
      mergeCookies(sessionResponse, rewrite);
      rewrite.cookies.set("kos-sf-lang", locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        httpOnly: false,
      });
      return await withThemeExperiment(request, rewrite, rewritten);
    }
  }

  if (process.env.STOREFRONT_REDIRECTS_ENABLED === "true" && process.env.STOREFRONT_MIDDLEWARE_SECRET) {
    const parsed = parseStorefrontInternalPath(pathname);
    if (parsed) {
      const secret = process.env.STOREFRONT_MIDDLEWARE_SECRET;
      try {
        const u = new URL("/api/storefront/resolve-redirect", request.nextUrl.origin);
        u.searchParams.set("slug", parsed.storeSlug);
        u.searchParams.set("path", parsed.suffix);
        const r = await fetch(u.toString(), {
          headers: { "x-kos-mw-secret": secret },
          cache: "no-store",
          signal: AbortSignal.timeout(2500),
        });
        if (r.ok) {
          const j = (await r.json()) as { location?: string | null; status?: number; disabled?: boolean };
          if (j.disabled) {
            /* flag flipped between env checks */
          } else if (j.location) {
            const target = new URL(j.location, request.url);
            const res = stampKosPathname(
              NextResponse.redirect(target, j.status === 301 ? 301 : 302),
              pathname,
            );
            mergeCookies(sessionResponse, res);
            return res;
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  const isAlreadyInternalStorefront = pathname.startsWith("/s/");
  const skipVanityRewrite =
    isAlreadyInternalStorefront ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/");

  if (!skipVanityRewrite && hostNoPort && hostNoPort !== appHostname) {
    const rootDomain = process.env.NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN?.trim().toLowerCase();
    let slug: string | null = null;
    let marketId: string | null = null;
    let brandId: string | null = null;
    let brandSlug: string | null = null;

    if (rootDomain) {
      const guess = await guessVanityHostFromLabel(hostRaw, rootDomain);
      if (guess.needsDbResolution) {
        const resolved = await fetchHostResolution(request, hostNoPort);
        slug = resolved.slug ?? guess.storeSlug;
        marketId = resolved.marketId ?? guess.marketId;
        brandId = resolved.brandId;
        brandSlug = resolved.brandSlug;
      } else {
        slug = guess.storeSlug;
        marketId = guess.marketId;
      }
    }

    if (!slug) {
      const resolved = await fetchHostResolution(request, hostNoPort);
      slug = resolved.slug;
      marketId = resolved.marketId ?? marketId;
      brandId = resolved.brandId ?? brandId;
      brandSlug = resolved.brandSlug ?? brandSlug;
    }

    if (slug) {
      const mapped = mapVanityPathToInternal(slug, pathname);
      if (mapped) {
        const url = request.nextUrl.clone();
        url.pathname = mapped.internal;
        let rewrite = stampStorefrontCdnTags(
          stampKosStorefrontPreview(
            stampKosPathname(NextResponse.rewrite(url), mapped.internal),
            request,
          ),
          mapped.internal,
          marketId,
        );
        rewrite = applyBrandContext(rewrite, brandId, brandSlug);
        mergeCookies(sessionResponse, rewrite);
        if (marketId) {
          rewrite.cookies.set(STOREFRONT_MARKET_COOKIE, marketId, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
            sameSite: "lax",
            httpOnly: false,
          });
        }
        if (mapped.locale) {
          rewrite.cookies.set("kos-sf-lang", mapped.locale, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
            sameSite: "lax",
            httpOnly: false,
          });
        }
        const ref = request.nextUrl.searchParams.get("ref");
        if (ref && /^[a-zA-Z0-9_-]{2,64}$/.test(ref)) {
          rewrite.cookies.set("kos_ref", ref.toUpperCase(), {
            path: "/",
            maxAge: 60 * 60 * 24 * 90,
            sameSite: "lax",
            httpOnly: false,
          });
        }
        return await withThemeExperiment(request, rewrite, mapped.internal);
      }
    }
  }

  const ref = request.nextUrl.searchParams.get("ref");
  if (ref && /^[a-zA-Z0-9_-]{2,64}$/.test(ref)) {
    const upper = ref.toUpperCase();
    sessionResponse.cookies.set("kos_ref", upper, {
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
      sameSite: "lax",
      httpOnly: false,
    });
  }
  const activeMarket = request.cookies.get(STOREFRONT_MARKET_COOKIE)?.value ?? null;
  let stamped = pathname.startsWith("/s/")
    ? stampStorefrontCdnTags(
        stampKosStorefrontPreview(stampKosPathname(sessionResponse, pathname), request),
        pathname,
        activeMarket,
      )
    : stampKosPathname(sessionResponse, pathname);

  if (pathname.startsWith("/s/")) {
    const hostBrand = stamped.headers.get(KOS_BRAND_ID_HEADER);
    if (hostBrand && isValidBrandId(hostBrand)) {
      stamped = applyBrandContext(stamped, hostBrand, stamped.headers.get(KOS_BRAND_SLUG_HEADER));
    } else {
      const cookieBrand = request.cookies.get("kos_brand")?.value ?? null;
      if (isValidBrandId(cookieBrand)) {
        stamped = applyBrandContext(
          stamped,
          cookieBrand,
          request.cookies.get("kos_brand_slug")?.value ?? null,
        );
      }
    }
  }

  if (pathname.startsWith("/s/")) {
    return await withThemeExperiment(request, stamped, pathname);
  }
  return stamped;
}

export const config = {
  // Theme experiment middleware reads many compliance snapshots that use node:crypto.
  runtime: "nodejs",
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
