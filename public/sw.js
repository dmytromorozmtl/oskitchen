/* KitchenOS production service worker — critical ops shell + offline POS sync */
const CACHE_VERSION = "kitchenos-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

const CRITICAL_PREFIXES = [
  "/dashboard/production",
  "/dashboard/kitchen",
  "/dashboard/kds",
  "/dashboard/packing",
  "/dashboard/pos",
];

const KDS_OFFLINE_BANNER = "Offline mode — showing last cached kitchen data";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(["/favicon.svg", "/manifest.webmanifest"]),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (CRITICAL_PREFIXES.some((p) => url.pathname.startsWith(p))) {
    event.respondWith(staleWhileRevalidate(request, PAGE_CACHE));
    return;
  }

  if (url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/cron")) {
    event.respondWith(networkFirst(request));
    return;
  }
});

const OFFLINE_POS_SYNC_TAG = "kitchenos-offline-pos";
/** Cache namespace for offline POS payloads (client IndexedDB is primary queue). */
const OFFLINE_POS_QUEUE = `${CACHE_VERSION}-offline-pos`;

self.addEventListener("sync", (event) => {
  if (event.tag === OFFLINE_POS_SYNC_TAG) {
    event.waitUntil(
      Promise.all([notifyClientsToFlushOfflinePos(), caches.open(OFFLINE_POS_QUEUE)]),
    );
  }
});

async function notifyClientsToFlushOfflinePos() {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({ type: "OFFLINE_POS_SYNC" });
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "REGISTER_OFFLINE_POS_SYNC") {
    event.waitUntil(self.registration.sync.register(OFFLINE_POS_SYNC_TAG).catch(() => undefined));
  }
});

/** When connectivity returns, prompt POS clients to flush IndexedDB checkout queue. */
self.addEventListener("online", () => {
  void notifyClientsToFlushOfflinePos();
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  });
  return cached ?? fetchPromise;
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    return res;
  } catch {
    const cache = await caches.open(PAGE_CACHE);
    const cached = await cache.match(request);
    if (cached && CRITICAL_PREFIXES.some((p) => new URL(request.url).pathname.startsWith(p))) {
      return cached;
    }
    return cached ?? new Response(KDS_OFFLINE_BANNER, { status: 503 });
  }
}

self.addEventListener("push", (event) => {
  let data = { title: "KitchenOS", body: "New update", url: "/dashboard/today", tag: "kitchenos" };
  try {
    data = { ...data, ...JSON.parse(event.data?.text() ?? "{}") };
  } catch {
    /* default */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: data.tag,
      data: { url: data.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/dashboard/today";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
