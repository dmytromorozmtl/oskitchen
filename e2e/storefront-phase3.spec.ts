import { expect, test } from "@playwright/test";

function discoverSlug(): string | null {
  const fromEnv = process.env.E2E_STOREFRONT_SLUG?.trim();
  if (fromEnv) return fromEnv;
  return null;
}

test.describe("Storefront Phase 3 smoke", () => {
  test("theme page shows publish checklist", async ({ page }) => {
    test.skip(!process.env.E2E_LOGIN_EMAIL, "Requires authed dashboard session");
    await page.goto("/dashboard/storefront/theme");
    await expect(page.getByText("Publish checklist")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Curated theme presets")).toBeVisible();
  });

  test("public sitemap includes hreflang when slug configured", async ({ page }) => {
    const slug = discoverSlug();
    test.skip(!slug, "Set E2E_STOREFRONT_SLUG");
    const res = await page.goto(`/s/${slug}/sitemap.xml`);
    expect(res?.ok()).toBeTruthy();
    const xml = await res!.text();
    expect(xml).toContain("hreflang");
    expect(xml).toContain("xmlns:xhtml");
  });

  test("locale path sets cookie", async ({ page, context }) => {
    const slug = discoverSlug();
    test.skip(!slug, "Set E2E_STOREFRONT_SLUG");
    await page.goto(`/s/${slug}/fr/menu`);
    const cookies = await context.cookies();
    const lang = cookies.find((c) => c.name === "kos-sf-lang");
    expect(lang?.value).toBe("fr");
  });
});
