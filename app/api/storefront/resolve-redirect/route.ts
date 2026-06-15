import { NextResponse } from "next/server";

import { enforceStorefrontRouteRateLimit } from "@/lib/storefront/storefront-rate-limit";
import { requireStorefrontMiddlewareSecret } from "@/lib/storefront/storefront-middleware-secret";
import { resolveStorefrontRedirectForPath } from "@/services/storefront/storefront-redirect-service";

export const runtime = "nodejs";

/**
 * Internal helper for middleware: match `/s/[slug]/...` suffix to a redirect row.
 * Secured with `STOREFRONT_MIDDLEWARE_SECRET` — not for browser use.
 * Increments hitCount when a redirect is returned.
 */
export async function GET(request: Request) {
  const authError = requireStorefrontMiddlewareSecret(request);
  if (authError) {
    return authError;
  }

  const rate = await enforceStorefrontRouteRateLimit(request, "resolve-redirect");
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }
  if (process.env.STOREFRONT_REDIRECTS_ENABLED !== "true") {
    return NextResponse.json({ location: null, disabled: true });
  }
  const url = new URL(request.url);
  const slug = (url.searchParams.get("slug") ?? "").trim();
  const path = (url.searchParams.get("path") ?? "/").trim() || "/";
  if (!slug) {
    return NextResponse.json({ location: null });
  }

  const hit = await resolveStorefrontRedirectForPath({
    storeSlug: slug,
    pathSuffix: path.startsWith("/") ? path : `/${path}`,
    incrementHits: true,
  });
  if (!hit) {
    return NextResponse.json({ location: null });
  }
  return NextResponse.json({ location: hit.locationPath, status: hit.httpStatus });
}
