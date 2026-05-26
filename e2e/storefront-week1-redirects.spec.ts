import { test, expect } from "@playwright/test";

const base = process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "");
const slug = process.env.E2E_STOREFRONT_SLUG ?? process.env.E2E_STORE_SLUG ?? "hello";
const redirectsOn = process.env.STOREFRONT_REDIRECTS_ENABLED === "true";

test.describe("Week 1 storefront redirects", () => {
  test.skip(!base, "PLAYWRIGHT_BASE_URL required");
  test.skip(!redirectsOn, "STOREFRONT_REDIRECTS_ENABLED must be true");

  test("legacy-menu redirects to menu", async ({ request }) => {
    const url = `${base}/s/${slug}/legacy-menu`;
    const res = await request.get(url, { maxRedirects: 0 });
    expect([301, 302, 307, 308]).toContain(res.status());
    const loc = res.headers()["location"] ?? "";
    expect(loc).toMatch(/\/menu/);
  });

  test("order-now redirects to menu", async ({ request }) => {
    const url = `${base}/s/${slug}/order-now`;
    const res = await request.get(url, { maxRedirects: 0 });
    expect([301, 302, 307, 308]).toContain(res.status());
    const loc = res.headers()["location"] ?? "";
    expect(loc).toMatch(/\/menu/);
  });
});
