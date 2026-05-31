import { test, expect } from "@playwright/test";

async function discoverSlug(
  request: import("@playwright/test").APIRequestContext,
): Promise<string | null> {
  const env = process.env.E2E_STOREFRONT_SLUG?.trim() || process.env.E2E_STORE_SLUG?.trim();
  if (env) return env;
  for (const candidate of ["demo", "test-store", "kitchenos"]) {
    const res = await request.get(`/s/${candidate}/reservations`);
    if (res.ok()) return candidate;
  }
  return null;
}

let storeSlug: string | null = null;

test.beforeAll(async ({ request }) => {
  storeSlug = await discoverSlug(request);
});

test.describe("Public reservations", () => {
  test("reservations page renders booking widget", async ({ page }) => {
    test.skip(!storeSlug, "Set E2E_STOREFRONT_SLUG to a published storefront.");
    await page.goto(`/s/${storeSlug}/reservations`);
    await expect(page.getByTestId("public-reservation-widget")).toBeVisible();
    await expect(page.getByLabel(/date/i)).toBeVisible();
    await expect(page.getByLabel(/party size/i)).toBeVisible();
  });

  test("availability API returns slots for a future date", async ({ request }) => {
    test.skip(!storeSlug, "Set E2E_STOREFRONT_SLUG.");
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + 2);
    const dateIso = date.toISOString().slice(0, 10);
    const res = await request.get(
      `/api/storefront/reservations?storeSlug=${storeSlug}&date=${dateIso}&partySize=2`,
    );
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { ok?: boolean; slots?: unknown[] };
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.slots)).toBe(true);
  });
});
