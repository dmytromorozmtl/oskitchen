import { expect, test } from "@playwright/test";

const slug = process.env.E2E_STOREFRONT_SLUG?.trim() || process.env.E2E_STORE_SLUG?.trim() || "hello";

/**
 * Stripe Connect test-mode checkout — requires:
 * - dev server + published storefront with online checkout enabled
 * - STRIPE_SECRET_KEY (test) + Connect account on pilot
 * - STOREFRONT_E2E_STRIPE=1
 */
test.describe("Storefront Stripe checkout E2E", () => {
  test.beforeAll(() => {
    test.skip(process.env.STOREFRONT_E2E_STRIPE !== "1", "Set STOREFRONT_E2E_STRIPE=1");
    test.skip(
      Boolean(process.env.TURNSTILE_SECRET_KEY?.trim()),
      "Run with TURNSTILE_SECRET_KEY unset",
    );
    test.skip(!process.env.STRIPE_SECRET_KEY?.trim(), "STRIPE_SECRET_KEY required");
  });

  test("redirects to Stripe Checkout with test card", async ({ page, request }) => {
    try {
      const health = await request.get("/api/health", { timeout: 3_000 });
      if (!health.ok()) test.skip(true, "Dev server not running");
    } catch {
      test.skip(true, "Dev server not running");
    }

    const readiness = await request.get(
      `/api/storefront/catalog?storeSlug=${encodeURIComponent(slug)}`,
    );
    if (readiness.status() === 404) test.skip(true, "Storefront missing");

    const catalog = await readiness.json();
    const product = catalog.catalog?.products?.find((p: { canAddToCart?: boolean }) => p.canAddToCart !== false);
    if (!product) test.skip(true, "No products");

    const cartGet = await request.get(`/api/storefront/cart?storeSlug=${encodeURIComponent(slug)}`);
    const cartData = await cartGet.json();
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

    await page.getByLabel(/name/i).first().fill("Stripe E2E");
    await page.getByLabel(/email/i).fill(`e2e-stripe-${Date.now()}@example.com`);

    const online = page.getByText(/pay online|card|stripe/i).first();
    if (await online.isVisible()) await online.click();
    else test.skip(true, "Online checkout not enabled on pilot");

    const pickupDate = page.locator('input[name="pickupDate"]');
    if (await pickupDate.isVisible()) {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      await pickupDate.fill(d.toISOString().slice(0, 10));
    }

    const terms = page.getByRole("checkbox").first();
    if (await terms.isVisible()) await terms.check();

    await page.getByRole("button", { name: /place|submit|order/i }).click();

    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 });

    const cardFrame = page.frameLocator('iframe[name*="card"]').first();
    await cardFrame.locator('[name="cardnumber"]').fill("4242424242424242");
    await cardFrame.locator('[name="exp-date"]').fill("12/34");
    await cardFrame.locator('[name="cvc"]').fill("123");

    await page.getByRole("button", { name: /pay/i }).click();

    await expect(page).toHaveURL(new RegExp(`/s/${slug}/`), { timeout: 90_000 });
  });
});
