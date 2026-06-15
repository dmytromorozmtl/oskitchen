/**
 * k6 load test — public storefront checkout critical path.
 *
 * Run:
 *   BASE_URL=http://localhost:3000 STORE_SLUG=hello \
 *   k6 run scripts/load/storefront-checkout-critical-path.k6.js
 *
 * Optional env:
 *   K6_VUS=4
 *   K6_DURATION=1m
 *   K6_PACE_MS=12000
 *   CHECKOUT_P95_MS=5000
 *   CHECKOUT_STEP_P95_MS=2000
 *   CHECKOUT_FULFILLMENT=PICKUP|DELIVERY
 *   DELIVERY_ADDRESS="123 Main St, Brooklyn, NY"
 *
 * Notes:
 * - This exercises the anonymous checkout path up to "submit-ready":
 *   menu page -> catalog -> cart get -> cart patch -> optional shipping quote -> checkout page.
 * - The final order placement currently runs through a Next.js Server Action, so raw HTTP k6 does
 *   not hit the exact submit mutation. That final mutation remains covered by Playwright E2E.
 * - Each iteration simulates a distinct visitor IP via x-forwarded-for so the test reflects
 *   real multi-visitor traffic instead of a single-IP rate-limit bottleneck.
 */
import http from "k6/http";
import { check, fail, sleep } from "k6";

const base = (__ENV.BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const slug = (__ENV.STORE_SLUG || "hello").trim();
const fulfillment = (__ENV.CHECKOUT_FULFILLMENT || "PICKUP").trim().toUpperCase();
const deliveryAddress =
  (__ENV.DELIVERY_ADDRESS || "123 Main St, Brooklyn, NY 11201").trim();
const paceMs = Number(__ENV.K6_PACE_MS || 12000);
const checkoutP95Ms = Number(__ENV.CHECKOUT_P95_MS || 5000);
const stepP95Ms = Number(__ENV.CHECKOUT_STEP_P95_MS || 2000);
const strictChecks = String(__ENV.K6_STRICT_CHECKS || "1") !== "0";

export const options = {
  vus: Number(__ENV.K6_VUS || 4),
  duration: __ENV.K6_DURATION || "1m",
  thresholds: {
    checks: [strictChecks ? "rate>0.99" : "rate>0.95"],
    "http_req_failed{scenario:storefront_checkout}": ["rate<0.01"],
    "http_req_duration{scenario:storefront_checkout,step:menu_page}": [`p(95)<${stepP95Ms}`],
    "http_req_duration{scenario:storefront_checkout,step:catalog_api}": [`p(95)<${stepP95Ms}`],
    "http_req_duration{scenario:storefront_checkout,step:cart_get}": [`p(95)<${stepP95Ms}`],
    "http_req_duration{scenario:storefront_checkout,step:cart_patch}": [`p(95)<${stepP95Ms}`],
    "http_req_duration{scenario:storefront_checkout,step:checkout_page}": [`p(95)<${stepP95Ms}`],
    "http_req_duration{scenario:storefront_checkout,step:shipping_quote}": [`p(95)<${stepP95Ms}`],
    "iteration_duration{scenario:storefront_checkout}": [`p(95)<${checkoutP95Ms}`],
  },
};

function visitorIp() {
  const b = ((__VU - 1) % 250) + 1;
  const c = (Math.floor(__ITER / 250) % 250) + 1;
  const d = (__ITER % 250) + 2;
  return `10.${b}.${c}.${d}`;
}

function buildParams(ip, step, overrides) {
  const headers = {
    Accept: "application/json, text/html;q=0.9,*/*;q=0.8",
    "X-Forwarded-For": ip,
    "X-Real-IP": ip,
    "X-Kos-Visitor-Id": `k6-${__VU}-${__ITER}`,
    ...(overrides?.headers || {}),
  };
  return {
    ...(overrides || {}),
    headers,
    tags: {
      scenario: "storefront_checkout",
      step,
      ...(overrides?.tags || {}),
    },
  };
}

function expectOk(res, message, assertions) {
  const passed = check(res, assertions);
  if (!passed) {
    fail(
      `${message} (status=${res.status}, url=${res.url}, body=${String(res.body || "").slice(0, 240)})`,
    );
  }
}

export function setup() {
  const ip = "10.255.0.1";

  const catalogRes = http.get(
    `${base}/api/storefront/catalog?storeSlug=${encodeURIComponent(slug)}`,
    buildParams(ip, "catalog_api"),
  );
  expectOk(catalogRes, "Catalog bootstrap failed", {
    "catalog status 200": (r) => r.status === 200,
  });

  const catalog = catalogRes.json();
  const product =
    catalog &&
    catalog.catalog &&
    Array.isArray(catalog.catalog.products) &&
    catalog.catalog.products.find((row) => row.canAddToCart !== false);

  if (!product || !product.id) {
    fail(`No addable product found for storefront "${slug}"`);
  }

  const cartRes = http.get(
    `${base}/api/storefront/cart?storeSlug=${encodeURIComponent(slug)}`,
    buildParams(ip, "cart_get"),
  );
  expectOk(cartRes, "Cart bootstrap failed", {
    "cart status 200": (r) => r.status === 200,
  });

  const menuRes = http.get(`${base}/s/${slug}/menu`, buildParams(ip, "menu_page"));
  expectOk(menuRes, "Menu page bootstrap failed", {
    "menu status 200": (r) => r.status === 200,
    "menu contains heading": (r) => String(r.body || "").toLowerCase().includes("menu"),
  });

  return { productId: product.id };
}

export default function (data) {
  const ip = visitorIp();

  const cleanupBefore = http.del(
    `${base}/api/storefront/cart?storeSlug=${encodeURIComponent(slug)}`,
    null,
    buildParams(ip, "cart_cleanup"),
  );
  check(cleanupBefore, {
    "cleanup before ok": (r) => r.status === 200 || r.status === 404,
  });

  const menuRes = http.get(`${base}/s/${slug}/menu`, buildParams(ip, "menu_page"));
  expectOk(menuRes, "Menu page request failed", {
    "menu status 200": (r) => r.status === 200,
    "menu page has menu text": (r) => String(r.body || "").toLowerCase().includes("menu"),
  });

  const catalogRes = http.get(
    `${base}/api/storefront/catalog?storeSlug=${encodeURIComponent(slug)}`,
    buildParams(ip, "catalog_api"),
  );
  expectOk(catalogRes, "Catalog request failed", {
    "catalog status 200": (r) => r.status === 200,
    "catalog includes products": (r) => {
      const json = r.json();
      return Boolean(json?.catalog?.products?.length);
    },
  });

  const cartGet = http.get(
    `${base}/api/storefront/cart?storeSlug=${encodeURIComponent(slug)}`,
    buildParams(ip, "cart_get"),
  );
  expectOk(cartGet, "Cart GET failed", {
    "cart get status 200": (r) => r.status === 200,
    "cart get returns payload": (r) => Boolean(r.json()?.cart),
  });

  const cartJson = cartGet.json();
  const cartPatch = http.patch(
    `${base}/api/storefront/cart`,
    JSON.stringify({
      storeSlug: slug,
      clientPriceVersion: cartJson?.cart?.priceVersion,
      lineDelta: { productId: data.productId, delta: 1 },
      merge: true,
    }),
    buildParams(ip, "cart_patch", {
      headers: {
        "Content-Type": "application/json",
      },
    }),
  );
  expectOk(cartPatch, "Cart PATCH failed", {
    "cart patch status 200": (r) => r.status === 200,
    "cart patch has lines": (r) => (r.json()?.cart?.lines?.length || 0) >= 1,
  });

  if (fulfillment === "DELIVERY") {
    const subtotal = Number(cartPatch.json()?.cart?.subtotal ?? 0);
    const quoteRes = http.post(
      `${base}/api/storefront/shipping/quote`,
      JSON.stringify({
        storeSlug: slug,
        fulfillmentType: "DELIVERY",
        deliveryAddress,
        subtotal,
      }),
      buildParams(ip, "shipping_quote", {
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    expectOk(quoteRes, "Shipping quote failed", {
      "shipping quote status 200": (r) => r.status === 200,
      "shipping quote ok": (r) => r.json()?.ok === true,
    });
  }

  const checkoutRes = http.get(`${base}/s/${slug}/checkout`, buildParams(ip, "checkout_page"));
  expectOk(checkoutRes, "Checkout page request failed", {
    "checkout status 200": (r) => r.status === 200,
    "checkout has heading": (r) => String(r.body || "").toLowerCase().includes("checkout"),
  });

  const cleanupAfter = http.del(
    `${base}/api/storefront/cart?storeSlug=${encodeURIComponent(slug)}`,
    null,
    buildParams(ip, "cart_cleanup"),
  );
  check(cleanupAfter, {
    "cleanup after ok": (r) => r.status === 200 || r.status === 404,
  });

  sleep(paceMs / 1000);
}
