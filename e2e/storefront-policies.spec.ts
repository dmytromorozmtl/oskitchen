import { test, expect } from "@playwright/test";

const base = process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
const slug = process.env.E2E_STOREFRONT_SLUG ?? process.env.E2E_STORE_SLUG ?? "hello";

test.describe("Storefront policies (pilot)", () => {
  test("privacy policy returns 200", async ({ request }) => {
    const res = await request.get(`${base}/s/${slug}/policies/privacy`);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toMatch(/Privacy/i);
  });

  test("terms policy returns 200", async ({ request }) => {
    const res = await request.get(`${base}/s/${slug}/policies/terms`);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toMatch(/Terms/i);
  });
});
