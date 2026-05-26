import { test, expect } from "@playwright/test";

/**
 * Storefront smoke tests — safe without production secrets.
 * Set `E2E_STOREFRONT_SLUG` to pin a slug; otherwise we probe a few common names against `PLAYWRIGHT_BASE_URL`.
 */
async function discoverSlug(
  request: import("@playwright/test").APIRequestContext,
): Promise<string | null> {
  const env = process.env.E2E_STOREFRONT_SLUG?.trim();
  if (env) return env;
  for (const candidate of ["demo", "test-store", "kitchenos"]) {
    const res = await request.get(`/s/${candidate}`);
    if (res.ok()) return candidate;
  }
  return null;
}

let storeSlug: string | null = null;

test.beforeAll(async ({ request }) => {
  storeSlug = await discoverSlug(request);
});

test("public storefront loads", async ({ page }) => {
  test.skip(!storeSlug, "No public storefront slug (set E2E_STOREFRONT_SLUG or seed a published storefront).");
  await page.goto(`/s/${storeSlug}`);
  await expect(page.locator("body")).toBeVisible();
});

test("menu page loads", async ({ page }) => {
  test.skip(!storeSlug, "No public storefront slug.");
  await page.goto(`/s/${storeSlug}/menu`);
  await expect(page.locator("body")).toBeVisible();
});

test("cart page loads", async ({ page }) => {
  test.skip(!storeSlug, "No public storefront slug.");
  await page.goto(`/s/${storeSlug}/cart`);
  await expect(page.locator("body")).toBeVisible();
});

test("checkout page loads", async ({ page }) => {
  test.skip(!storeSlug, "No public storefront slug.");
  await page.goto(`/s/${storeSlug}/checkout`);
  await expect(page.locator("body")).toBeVisible();
});

test("about page loads", async ({ page }) => {
  test.skip(!storeSlug, "No public storefront slug.");
  await page.goto(`/s/${storeSlug}/about`);
  await expect(page.locator("body")).toBeVisible();
});
