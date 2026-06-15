import { test, expect } from "@playwright/test";

/**
 * Storefront regional / locale smoke — public site only.
 * Set E2E_STOREFRONT_SLUG to a published storefront slug.
 */
async function discoverSlug(
  request: import("@playwright/test").APIRequestContext,
): Promise<string | null> {
  const env = process.env.E2E_STOREFRONT_SLUG?.trim();
  if (env) return env;
  for (const candidate of ["demo", "test-store", "hello", "kitchenos"]) {
    const res = await request.get(`/s/${candidate}`);
    if (res.ok()) return candidate;
  }
  return null;
}

let storeSlug: string | null = null;

test.beforeAll(async ({ request }) => {
  storeSlug = await discoverSlug(request);
});

test("locale switcher updates query param", async ({ page }) => {
  test.skip(!storeSlug, "No public storefront slug.");
  await page.goto(`/s/${storeSlug}`);
  const select = page.locator('select[aria-label="Language"]');
  if ((await select.count()) === 0) {
    test.skip(true, "Locale switcher not rendered (single-locale storefront).");
  }
  await select.selectOption("fr");
  await expect(page).toHaveURL(/lang=fr/);
});
