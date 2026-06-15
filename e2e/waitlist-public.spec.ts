import { test, expect } from "@playwright/test";

async function discoverSlug(
  request: import("@playwright/test").APIRequestContext,
): Promise<string | null> {
  const env = process.env.E2E_STOREFRONT_SLUG?.trim() || process.env.E2E_STORE_SLUG?.trim();
  if (env) return env;
  for (const candidate of ["demo", "test-store", "kitchenos"]) {
    const res = await request.get(`/s/${candidate}/waitlist`);
    if (res.ok()) return candidate;
  }
  return null;
}

let storeSlug: string | null = null;

test.beforeAll(async ({ request }) => {
  storeSlug = await discoverSlug(request);
});

test.describe("Public waitlist", () => {
  test("waitlist page renders join widget", async ({ page }) => {
    test.skip(!storeSlug, "Set E2E_STOREFRONT_SLUG to a published storefront.");
    await page.goto(`/s/${storeSlug}/waitlist`);
    await expect(page.getByTestId("public-waitlist-widget")).toBeVisible();
    await expect(page.getByLabel(/^name$/i)).toBeVisible();
    await expect(page.getByLabel(/mobile phone/i)).toBeVisible();
  });

  test("waitlist API accepts join payload shape", async ({ request }) => {
    test.skip(!storeSlug, "Set E2E_STOREFRONT_SLUG.");
    const res = await request.post("/api/storefront/waitlist", {
      data: {
        storeSlug,
        customerName: "QA Bot",
        customerPhone: "+15555550123",
        partySize: 2,
      },
    });
    expect([200, 409]).toContain(res.status());
    const body = (await res.json()) as { ok?: boolean; entryId?: string; error?: string };
    if (res.ok()) {
      expect(body.ok).toBe(true);
      expect(body.entryId).toBeTruthy();
    }
  });
});
