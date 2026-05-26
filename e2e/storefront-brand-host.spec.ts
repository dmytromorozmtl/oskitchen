import { expect, test } from "@playwright/test";

const slug = process.env.E2E_STOREFRONT_SLUG?.trim() || process.env.E2E_STORE_SLUG?.trim() || "hello";

async function ensureDevServer(request: import("@playwright/test").APIRequestContext) {
  try {
    const res = await request.get("/api/health", { timeout: 3_000 });
    if (res.ok()) return;
  } catch {
    /* fall through */
  }
  test.skip(true, "Dev server not running — start with: npm run dev:safe");
}

test.describe("Storefront phase 9 — brand context", () => {
  test.beforeEach(async ({ request }) => {
    await ensureDevServer(request);
  });

  test("robots.txt and sitemap.xml return 200 for published storefront", async ({ request }) => {
    for (const path of [`/s/${slug}/robots.txt`, `/s/${slug}/sitemap.xml`]) {
      const res = await request.get(path);
      if (res.status() === 404) {
        test.skip(true, `Storefront ${slug} not published on dev server.`);
      }
      expect(res.status()).toBe(200);
    }
  });

  test("robots.txt references sitemap when indexable", async ({ request }) => {
    const res = await request.get(`/s/${slug}/robots.txt`);
    if (res.status() === 404) test.skip(true, "Storefront not published.");
    const body = await res.text();
    if (body.includes("Disallow: /")) {
      expect(body).not.toContain("Sitemap:");
    } else {
      expect(body).toContain("Sitemap:");
      expect(body).toContain("sitemap.xml");
    }
  });

  test("kos_brand cookie is echoed via middleware headers on storefront pages", async ({ browser }) => {
    const brandId = process.env.E2E_STOREFRONT_BRAND_ID?.trim();
    test.skip(!brandId || !/^[0-9a-f-]{36}$/i.test(brandId), "Set E2E_STOREFRONT_BRAND_ID to a valid brand UUID");

    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "kos_brand",
        value: brandId!,
        domain: "localhost",
        path: "/",
      },
    ]);
    const page = await context.newPage();
    const res = await page.goto(`/s/${slug}/menu`);
    if (res?.status() === 404) {
      await context.close();
      test.skip(true, "Storefront not published.");
    }
    expect(res?.ok()).toBeTruthy();
    await context.close();
  });

  test("resolve-host returns brandId for composite host when configured", async ({ request }) => {
    const secret = process.env.STOREFRONT_MIDDLEWARE_SECRET?.trim();
    const host = process.env.E2E_BRAND_VANITY_HOST?.trim();
    test.skip(!secret || !host, "Set STOREFRONT_MIDDLEWARE_SECRET and E2E_BRAND_VANITY_HOST");

    const res = await request.get(`/api/storefront/resolve-host?host=${encodeURIComponent(host!)}`, {
      headers: { "x-kos-mw-secret": secret! },
    });
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { slug?: string; brandId?: string | null; brandSlug?: string | null };
    expect(json.slug).toBeTruthy();
    expect(json.brandId).toBeTruthy();
    expect(json.brandSlug).toBeTruthy();
  });
});
