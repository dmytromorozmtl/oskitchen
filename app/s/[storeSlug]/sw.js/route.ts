import { NextResponse } from "next/server";

import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";

/**
 * Branded storefront service worker — scoped to /s/{slug} for installable customer PWA.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ storeSlug: string }> },
) {
  const { storeSlug } = await ctx.params;
  const sf = await getStorefrontForPublicFromRequest(storeSlug, null);
  if (!sf) {
    return new NextResponse("// not found", { status: 404 });
  }

  const cacheName = `kos-sf-${storeSlug.replace(/[^a-z0-9-]/gi, "")}-v1`;
  const body = `
const CACHE = ${JSON.stringify(cacheName)};
const SCOPE_PREFIX = ${JSON.stringify(`/s/${storeSlug}`)};

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([SCOPE_PREFIX, SCOPE_PREFIX + "/menu", "/favicon.svg"]),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith("kos-sf-") && k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (!url.pathname.startsWith(SCOPE_PREFIX)) return;

  if (url.pathname.includes("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request).then((r) => r || caches.match(SCOPE_PREFIX))),
  );
});
`.trim();

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
