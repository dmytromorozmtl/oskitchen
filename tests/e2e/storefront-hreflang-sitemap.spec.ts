import { test, expect } from "@playwright/test";

const storeSlug = process.env.E2E_STORE_SLUG ?? process.env.E2E_STOREFRONT_SLUG ?? "demo";

test.describe("storefront hreflang parity", () => {
  test.skip(!process.env.E2E_BASE_URL, "Set E2E_BASE_URL to run storefront E2E");

  test("PDP alternates appear in sitemap urlset for products", async ({ request }) => {
    const base = process.env.E2E_BASE_URL!.replace(/\/$/, "");
    const menuRes = await request.get(`${base}/s/${storeSlug}/menu`);
    expect(menuRes.ok()).toBeTruthy();
    const menuHtml = await menuRes.text();
    const productMatch = menuHtml.match(/href="\/s\/[^"]+\/products\/([^"?]+)"/);
    test.skip(!productMatch, "No product link on menu page");
    const segment = decodeURIComponent(productMatch![1]!);

    const pdpRes = await request.get(`${base}/s/${storeSlug}/products/${segment}`);
    expect(pdpRes.ok()).toBeTruthy();
    const pdpHtml = await pdpRes.text();
    const hreflangCount = (pdpHtml.match(/hreflang="/g) ?? []).length;

    const sitemapRes = await request.get(`${base}/s/${storeSlug}/sitemap.xml`);
    expect(sitemapRes.ok()).toBeTruthy();
    const sitemapXml = await sitemapRes.text();
    expect(sitemapXml).toContain(`/products/${segment}`);
    if (hreflangCount > 0) {
      expect(sitemapXml).toContain('rel="alternate"');
    }
  });
});
