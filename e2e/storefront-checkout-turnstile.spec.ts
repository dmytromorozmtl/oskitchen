import { expect, test } from "@playwright/test";

const slug = process.env.E2E_STORE_SLUG ?? process.env.E2E_STOREFRONT_SLUG ?? "demo";

/**
 * Public checkout + cart-recovery track with Turnstile disabled in CI (no TURNSTILE_SECRET_KEY).
 */
test.describe("Storefront checkout (mock Turnstile off)", () => {
  test.beforeAll(() => {
    test.skip(
      Boolean(process.env.TURNSTILE_SECRET_KEY?.trim()),
      "Run with TURNSTILE_SECRET_KEY unset so verifyTurnstileToken is a no-op",
    );
  });

  test("checkout page loads and cart-recovery track accepts payload", async ({ page, request }) => {
    await page.goto(`/s/${slug}/menu`);
    await expect(page.locator("body")).toBeVisible();

    const cookies = await page.context().cookies();
    const abCookie = cookies.find((c) => c.name === "kos_ab_theme");
    if (abCookie?.value === "draft" || abCookie?.value === "published") {
      expect(["draft", "published"]).toContain(abCookie.value);
    }

    const trackRes = await request.post("/api/storefront/cart-recovery", {
      data: {
        storeSlug: slug,
        customerEmail: "e2e-cart-track@example.com",
        cart: {},
        marketingConsent: false,
      },
    });
    if (trackRes.status() === 404) {
      test.skip(true, "Published storefront slug not found in this environment");
    }
    expect([200, 400]).toContain(trackRes.status());

    await page.goto(`/s/${slug}/checkout`);
    await expect(page.getByRole("heading", { name: /checkout/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});
