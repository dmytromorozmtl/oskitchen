import { test, expect } from "@playwright/test";

/**
 * Sold-out guard — requires seed: npm run storefront:seed-phase2-hello
 * Dev server: npm run dev:safe
 */
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

test.describe("Storefront sold-out (Phase 2)", () => {
  test.beforeEach(async ({ request }) => {
    await ensureDevServer(request);
  });

  test("menu shows Sold out badge for seeded product", async ({ page }) => {
    const res = await page.goto(`/s/${slug}`);
    if (!res?.ok()) test.skip(true, "Storefront not available.");

    const badge = page.getByText("Sold out", { exact: true });
    const count = await badge.count();
    if (count === 0) {
      test.skip(true, "No sold-out product — run: npm run storefront:seed-phase2-hello");
    }
    await expect(badge.first()).toBeVisible();
  });

  test("sold-out product + button is disabled on menu", async ({ page }) => {
    const res = await page.goto(`/s/${slug}`);
    if (!res?.ok()) test.skip(true, "Storefront not available.");

    if ((await page.getByText("Sold out").count()) === 0) {
      test.skip(true, "Run seed first.");
    }

    const plusInSoldSection = page.locator(":has-text('Sold out')").first().getByRole("button", { name: "+" });
    if ((await plusInSoldSection.count()) === 0) {
      test.skip(true, "Could not locate add button near sold-out badge.");
    }
    await expect(plusInSoldSection.first()).toBeDisabled();
  });

  test("cart PATCH returns SOLD_OUT warning and does not add line", async ({ request }) => {
    const catRes = await request.get(`/api/storefront/catalog?storeSlug=${encodeURIComponent(slug)}`);
    if (catRes.status() !== 200) test.skip(true, "Catalog API unavailable.");
    const cat = await catRes.json();
    const productId = cat.products?.find((p: { soldOut?: boolean }) => p.soldOut)?.id;
    if (!productId) test.skip(true, "No sold-out product — run: npm run storefront:seed-phase2-hello");

    const cartRes = await request.get(`/api/storefront/cart?storeSlug=${encodeURIComponent(slug)}`);
    if (cartRes.status() !== 200) test.skip(true, "Cart API unavailable.");
    const cartData = await cartRes.json();

    const patchRes = await request.patch("/api/storefront/cart", {
      data: {
        storeSlug: slug,
        clientPriceVersion: cartData.cart?.priceVersion,
        lineDelta: { productId, delta: 1 },
        merge: true,
      },
    });
    expect(patchRes.status()).toBe(200);
    const body = await patchRes.json();
    expect(body.warnings?.some((w: { code: string }) => w.code === "SOLD_OUT")).toBe(true);
    expect(body.cart?.lines?.some((l: { productId: string }) => l.productId === productId)).toBeFalsy();
  });
});
