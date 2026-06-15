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

test.describe("Storefront order flow (guest)", () => {
  test.beforeAll(() => {
    test.skip(
      Boolean(process.env.TURNSTILE_SECRET_KEY?.trim()),
      "Run with TURNSTILE_SECRET_KEY unset so captcha is a no-op",
    );
  });

  test.beforeEach(async ({ request }) => {
    await ensureDevServer(request);
  });

  test("guest browses menu, adds to cart, completes pay-later checkout", async ({ page, request }) => {
    const menuRes = await request.get(`/s/${slug}/menu`);
    if (menuRes.status() === 404) test.skip(true, "Storefront not published.");

    await page.goto(`/s/${slug}/menu`);
    await expect(page.getByRole("heading", { name: /menu/i })).toBeVisible({ timeout: 20_000 });

    const catalogRes = await request.get(`/api/storefront/catalog?storeSlug=${encodeURIComponent(slug)}`);
    expect(catalogRes.status()).toBe(200);
    const catalog = await catalogRes.json();
    const product = catalog.catalog?.products?.find((p: { canAddToCart?: boolean }) => p.canAddToCart !== false);
    if (!product) test.skip(true, "No addable products in catalog.");

    const cartGet = await request.get(`/api/storefront/cart?storeSlug=${encodeURIComponent(slug)}`);
    expect(cartGet.status()).toBe(200);
    const cartData = await cartGet.json();

    const patchRes = await request.patch("/api/storefront/cart", {
      data: {
        storeSlug: slug,
        clientPriceVersion: cartData.cart?.priceVersion,
        lineDelta: { productId: product.id, delta: 1 },
        merge: true,
      },
    });
    expect(patchRes.status()).toBe(200);

    await page.goto(`/s/${slug}/cart`);
    await expect(page.getByText(/cart|item/i).first()).toBeVisible({ timeout: 15_000 });

    await page.goto(`/s/${slug}/checkout`);
    await expect(page.getByRole("heading", { name: /checkout/i })).toBeVisible({ timeout: 20_000 });

    await page.getByLabel(/name/i).first().fill("E2E Storefront Guest");
    await page.getByLabel(/email/i).fill(`e2e-storefront-${Date.now()}@example.com`);
    const phone = page.getByLabel(/phone/i);
    if (await phone.isVisible()) await phone.fill("5550100299");

    const pickupDate = page.locator('input[name="pickupDate"]');
    if (await pickupDate.isVisible()) {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      await pickupDate.fill(d.toISOString().slice(0, 10));
    }

    const terms = page.getByRole("checkbox").first();
    if (await terms.isVisible()) await terms.check();

    const payLater = page.getByText(/pay later/i).first();
    if (await payLater.isVisible()) await payLater.click();

    await page.getByRole("button", { name: /place|submit|order/i }).click();

    await expect(page).toHaveURL(new RegExp(`/s/${slug}/order/`), { timeout: 45_000 });
    await expect(page.getByText(/order|confirmed|thank/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
