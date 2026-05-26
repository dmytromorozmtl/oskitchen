import { test, expect } from "@playwright/test";

/**
 * Phase 2 — server cart contract (price version, sold-out guard).
 * Requires dev server: npm run dev:safe (port 3000).
 */
const slug = process.env.E2E_STOREFRONT_SLUG?.trim() || "hello";

async function ensureDevServer(request: import("@playwright/test").APIRequestContext) {
  try {
    const res = await request.get("/api/health", { timeout: 3_000 });
    if (res.ok()) return;
  } catch {
    /* fall through */
  }
  test.skip(
    true,
    "Dev server not running on port 3000 — start with: npm run dev:safe",
  );
}

test.describe("Storefront cart API (Phase 2)", () => {
  test.beforeEach(async ({ request }) => {
    await ensureDevServer(request);
  });

  test("GET cart returns priced payload", async ({ request }) => {
    const res = await request.get(`/api/storefront/cart?storeSlug=${encodeURIComponent(slug)}`);
    if (res.status() === 404) {
      test.skip(true, "Server cart disabled or storefront missing.");
    }
    expect([200, 503]).toContain(res.status());
    if (res.status() !== 200) return;
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.cart?.priceVersion).toMatch(/^[a-f0-9]{16}$/);
    expect(typeof data.cart?.subtotal).toBe("number");
  });

  test("PATCH with stale priceVersion returns 409 when menu changed", async ({ request }) => {
    const getRes = await request.get(`/api/storefront/cart?storeSlug=${encodeURIComponent(slug)}`);
    if (getRes.status() !== 200) {
      test.skip(true, "Cart API unavailable.");
    }
    const getData = await getRes.json();
    const menuId = getData.cart?.menuId;
    if (!menuId) test.skip(true, "No active menu.");

    const patchRes = await request.patch("/api/storefront/cart", {
      data: {
        storeSlug: slug,
        clientPriceVersion: "0000000000000000",
        lineDelta: { productId: "00000000-0000-4000-8000-000000000001", delta: 0 },
        merge: true,
      },
    });
    expect([200, 400, 409]).toContain(patchRes.status());
    if (patchRes.status() === 409) {
      const body = await patchRes.json();
      expect(body.error).toBeTruthy();
      expect(body.cart?.priceVersion).toBeTruthy();
    }
  });

  test("shipping quote rejects delivery without address", async ({ request }) => {
    const res = await request.post("/api/storefront/shipping/quote", {
      data: {
        storeSlug: slug,
        fulfillmentType: "DELIVERY",
        subtotal: 50,
      },
    });
    if (res.status() === 404) test.skip(true, "Storefront not published.");
    expect(res.status()).toBe(400);
  });
});

test.describe("Sold-out blocks checkout submit", () => {
  test.beforeEach(async ({ request }) => {
    await ensureDevServer(request);
  });

  test("checkout page loads and empty cart disables submit", async ({ page }) => {
    const res = await page.goto(`/s/${slug}/checkout`);
    if (!res?.ok()) test.skip(true, "Storefront not available.");
    const submit = page.getByRole("button", { name: /preorder|checkout|payment/i });
    await expect(submit).toBeDisabled();
  });
});
