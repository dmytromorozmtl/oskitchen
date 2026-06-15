#!/usr/bin/env node
/**
 * Lightweight load probe for storefront analytics + checkout rate limits.
 * Usage: BASE_URL=https://localhost:3000 STORE_SLUG=demo node scripts/load-test-storefront.mjs
 */
const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const slug = process.env.STORE_SLUG ?? "demo";
const n = Number(process.env.REQUESTS ?? "20");

async function hit(path, init) {
  const t0 = performance.now();
  const res = await fetch(`${base}${path}`, init);
  return { status: res.status, ms: Math.round(performance.now() - t0) };
}

const results = [];
for (let i = 0; i < n; i++) {
  results.push(
    await hit(`/api/storefront/analytics`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        storeSlug: slug,
        eventName: "page_view",
        path: "/menu",
        clientSentAt: new Date().toISOString(),
      }),
    }),
  );
}

const byStatus = results.reduce((acc, r) => {
  acc[r.status] = (acc[r.status] ?? 0) + 1;
  return acc;
}, {});
const rateLimited = byStatus[429] ?? 0;
const max429 = Number(process.env.MAX_429_COUNT ?? "0");
if (rateLimited > max429) {
  console.error(`Too many 429 responses: ${rateLimited} (max ${max429})`);
  process.exit(1);
}
const avgMs = Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length);
console.log(JSON.stringify({ slug, requests: n, byStatus, avgMs, rateLimited }, null, 2));
