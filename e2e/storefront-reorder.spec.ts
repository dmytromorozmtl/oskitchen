import { test, expect } from "@playwright/test";

const slug = process.env.E2E_STOREFRONT_SLUG?.trim() || "hello";

async function ensureDevServer(request: import("@playwright/test").APIRequestContext) {
  try {
    const res = await request.get("/api/health", { timeout: 3_000 });
    if (res.ok()) return;
  } catch {
    /* fall through */
  }
  test.skip(true, "Dev server not running — npm run dev:safe");
}

test.describe("Storefront reorder (Phase 2.5)", () => {
  test.beforeEach(async ({ request }) => {
    await ensureDevServer(request);
  });

  test("reorder API returns cart when order exists", async ({ request }) => {
    const ordersRes = await request.post("/api/storefront/account/orders", {
      data: { storeSlug: slug, email: process.env.E2E_STOREFRONT_EMAIL ?? "test@example.com" },
    });
    if (ordersRes.status() === 404) test.skip(true, "Storefront missing.");

    let token: string | undefined;
    if (ordersRes.ok()) {
      const data = await ordersRes.json();
      token = data.orders?.[0]?.token;
    }

    if (!token) {
      const cat = await request.get(`/api/storefront/catalog?storeSlug=${encodeURIComponent(slug)}`);
      if (!cat.ok()) test.skip(true, "No orders and no catalog.");
      test.skip(true, "Place a test order first or set E2E_STOREFRONT_EMAIL with orders.");
    }

    const reorderRes = await request.post("/api/storefront/account/reorder", {
      data: { storeSlug: slug, orderToken: token, merge: false },
    });
    expect([200, 409]).toContain(reorderRes.status());
    if (reorderRes.status() === 200) {
      const body = await reorderRes.json();
      expect(body.ok).toBe(true);
      expect(body.cart?.lines?.length).toBeGreaterThan(0);
      if (body.marketId) {
        expect(String(body.redirectTo)).toContain("market=");
      }
    }
  });
});
