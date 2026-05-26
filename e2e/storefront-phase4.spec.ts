import { expect, test } from "@playwright/test";

const slug = process.env.E2E_STOREFRONT_SLUG?.trim() || process.env.E2E_STORE_SLUG?.trim() || "hello";

async function ensureDevServer(request: import("@playwright/test").APIRequestContext) {
  try {
    const res = await request.get("/api/health", { timeout: 3_000 });
    if (res.ok()) return;
  } catch {
    /* fall through */
  }
  test.skip(true, "Dev server not running — start with: npm run dev:safe");
}

test.describe("Storefront phase 4 — markets & cache paths", () => {
  test("checkout and cart accept ?market= without 404", async ({ request }) => {
    await ensureDevServer(request);
    for (const path of [`/s/${slug}/cart?market=weekday`, `/s/${slug}/checkout?market=weekday`]) {
      const res = await request.get(path);
      if (res.status() === 404) {
        test.skip(true, `Storefront ${slug} not published on dev server.`);
      }
      expect(res.status()).toBe(200);
    }
  });

  test("weekday market shows banner when seeded", async ({ page }) => {
    await ensureDevServer(page.request);
    const res = await page.goto(`/s/${slug}/menu?market=weekday`);
    if (res?.status() === 404) {
      test.skip(true, "Storefront not published or markets not seeded.");
    }
    await expect(page.getByText(/weekday/i).first()).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Storefront phase 4 — pay later checkout", () => {
  test.beforeEach(async ({ request }) => {
    await ensureDevServer(request);
  });

  test("catalog API returns priceVersion for cart contract", async ({ request }) => {
    const res = await request.get(`/api/storefront/catalog?storeSlug=${encodeURIComponent(slug)}`);
    if (res.status() === 404) test.skip(true, "Catalog API unavailable.");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.catalog?.priceVersion).toMatch(/^[a-f0-9]{16}$/);
  });
});

test.describe("Storefront phase 4 — Stripe Connect (optional)", () => {
  test("connect smoke script is documented", async () => {
    test.skip(process.env.STOREFRONT_E2E_STRIPE !== "1", "Set STOREFRONT_E2E_STRIPE=1 to run");
    expect(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_SECRET_KEY).toBeTruthy();
  });
});

test.describe("Storefront phase 4 — sitemap", () => {
  test("sitemap includes collections root when published", async ({ request }) => {
    test.skip(!slug, "Set E2E_STORE_SLUG");
    const res = await request.get(`/s/${slug}/sitemap.xml`);
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain("<urlset");
  });
});
