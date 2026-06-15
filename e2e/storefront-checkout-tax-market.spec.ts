import { expect, test } from "@playwright/test";

const STOREFRONT_MARKET_COOKIE = "kos_market";

const slug = process.env.E2E_STOREFRONT_SLUG?.trim() || process.env.E2E_STORE_SLUG?.trim() || "hello";
const marketId = process.env.E2E_STOREFRONT_MARKET_ID?.trim() || "weekday";
const expectTaxLabel = process.env.E2E_STOREFRONT_TAX_LABEL?.trim();

async function ensureDevServer(request: import("@playwright/test").APIRequestContext) {
  try {
    const res = await request.get("/api/health", { timeout: 3_000 });
    if (res.ok()) return;
  } catch {
    /* fall through */
  }
  test.skip(true, "Dev server not running — start with: npm run dev:safe");
}

test.describe("Storefront checkout — market + tax", () => {
  test.beforeAll(() => {
    test.skip(
      Boolean(process.env.TURNSTILE_SECRET_KEY?.trim()),
      "Run with TURNSTILE_SECRET_KEY unset so captcha is a no-op",
    );
  });

  test.beforeEach(async ({ request }) => {
    await ensureDevServer(request);
  });

  test("?market= persists kos_market cookie on menu", async ({ page, context }) => {
    await page.goto(`/s/${slug}/menu?market=${encodeURIComponent(marketId)}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });

    const cookies = await context.cookies();
    const marketCookie = cookies.find((c) => c.name === STOREFRONT_MARKET_COOKIE);
    expect(marketCookie?.value).toBe(marketId);
  });

  test("checkout summary shows tax lines when configured", async ({ page, request }) => {
    test.skip(!expectTaxLabel, "Set E2E_STOREFRONT_TAX_LABEL (e.g. GST) after configuring tax in Ordering");

    const catalogRes = await request.get(`/api/storefront/catalog?storeSlug=${encodeURIComponent(slug)}`);
    if (!catalogRes.ok()) test.skip(true, "Catalog unavailable");
    const catalog = await catalogRes.json();
    const product = catalog.catalog?.products?.find((p: { canAddToCart?: boolean }) => p.canAddToCart !== false);
    if (!product) test.skip(true, "No addable products");

    const cartGet = await request.get(`/api/storefront/cart?storeSlug=${encodeURIComponent(slug)}`);
    const cartData = cartGet.ok() ? await cartGet.json() : {};

    await request.patch("/api/storefront/cart", {
      data: {
        storeSlug: slug,
        clientPriceVersion: cartData.cart?.priceVersion,
        lineDelta: { productId: product.id, delta: 1 },
        merge: true,
      },
    });

    await page.goto(`/s/${slug}/checkout?market=${encodeURIComponent(marketId)}`);
    await expect(page.getByRole("heading", { name: /checkout/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(expectTaxLabel!, { exact: false }).first()).toBeVisible({ timeout: 10_000 });
  });

  test("pay-later order + reorder returns marketId", async ({ page, request, context }) => {
    const catalogRes = await request.get(`/api/storefront/catalog?storeSlug=${encodeURIComponent(slug)}`);
    if (!catalogRes.ok()) test.skip(true, "Catalog unavailable");
    const catalog = await catalogRes.json();
    const product = catalog.catalog?.products?.find((p: { canAddToCart?: boolean }) => p.canAddToCart !== false);
    if (!product) test.skip(true, "No addable products");

    await context.addCookies([
      {
        name: STOREFRONT_MARKET_COOKIE,
        value: marketId,
        domain: "localhost",
        path: "/",
        sameSite: "Lax",
      },
    ]);

    const cartGet = await request.get(`/api/storefront/cart?storeSlug=${encodeURIComponent(slug)}`);
    const cartData = cartGet.ok() ? await cartGet.json() : {};
    await request.patch("/api/storefront/cart", {
      data: {
        storeSlug: slug,
        clientPriceVersion: cartData.cart?.priceVersion,
        lineDelta: { productId: product.id, delta: 1 },
        merge: true,
      },
    });

    await page.goto(`/s/${slug}/checkout`);
    await expect(page.getByRole("heading", { name: /checkout/i })).toBeVisible({ timeout: 20_000 });

    const email = `e2e-market-tax-${Date.now()}@example.com`;
    await page.getByLabel(/name/i).first().fill("E2E Market Tax");
    await page.getByLabel(/email/i).fill(email);
    const pickupDate = page.locator('input[name="pickupDate"]');
    if (await pickupDate.isVisible()) {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      await pickupDate.fill(d.toISOString().slice(0, 10));
    }
    const terms = page.getByRole("checkbox").first();
    if (await terms.isVisible()) await terms.check();
    await page.getByRole("button", { name: /place|submit|order/i }).click();
    await expect(page).toHaveURL(new RegExp(`/s/${slug}/order/`), { timeout: 45_000 });

    const tokenMatch = page.url().match(/\/order\/([^/?]+)/);
    const token = tokenMatch?.[1];
    expect(token).toBeTruthy();

    const reorderRes = await request.post("/api/storefront/account/reorder", {
      data: { storeSlug: slug, orderToken: token, merge: false },
    });
    if (reorderRes.status() === 404) test.skip(true, "Server cart disabled");
    expect([200, 409]).toContain(reorderRes.status());
    if (reorderRes.status() === 200) {
      const body = await reorderRes.json();
      expect(body.marketId).toBe(marketId);
      expect(String(body.redirectTo)).toContain(`market=${encodeURIComponent(marketId)}`);
    }
  });
});
