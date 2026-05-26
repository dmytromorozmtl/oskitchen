import { test, expect } from "@playwright/test";

/**
 * Contact / catering form smoke — staging or local with published slug.
 * Turnstile is off in CI when TURNSTILE_SECRET_KEY is unset.
 */
async function discoverSlug(
  request: import("@playwright/test").APIRequestContext,
): Promise<string | null> {
  const env = process.env.E2E_STOREFRONT_SLUG?.trim() || process.env.E2E_STORE_SLUG?.trim();
  if (env) return env;
  for (const candidate of ["demo", "test-store", "kitchenos"]) {
    const res = await request.get(`/s/${candidate}/contact`);
    if (res.ok()) return candidate;
  }
  return null;
}

let storeSlug: string | null = null;

test.beforeAll(async ({ request }) => {
  storeSlug = await discoverSlug(request);
});

test.describe("Storefront contact forms", () => {
  test("contact page renders form fields", async ({ page }) => {
    test.skip(!storeSlug, "Set E2E_STOREFRONT_SLUG to a published storefront.");
    await page.goto(`/s/${storeSlug}/contact`);
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
  });

  test("honeypot companyUrl does not block visible submit path", async ({ page }) => {
    test.skip(!storeSlug, "Set E2E_STOREFRONT_SLUG.");
    await page.goto(`/s/${storeSlug}/contact`);
    const honeypot = page.locator('input[name="companyUrl"]');
    await expect(honeypot).toHaveCount(1);
    await honeypot.fill("https://spam.example");
    await page.getByLabel(/^name$/i).fill("QA Bot");
    await page.getByLabel(/^email$/i).fill("qa-bot@example.com");
    await page.getByLabel(/^message/i).fill("Automated honeypot check — should not create submission.");
    await page.getByRole("button", { name: /send/i }).click();
    await expect(page.getByText(/thank you|sent/i)).toBeVisible({ timeout: 15_000 });
  });

  test("catering page loads", async ({ page }) => {
    test.skip(!storeSlug, "Set E2E_STOREFRONT_SLUG.");
    const res = await page.goto(`/s/${storeSlug}/catering`);
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });
});
