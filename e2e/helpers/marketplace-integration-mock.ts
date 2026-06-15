import type { Page } from "@playwright/test";

/** Stub DoorDash marketplace API when DOORDASH_E2E_CONNECTION_ID is unset. */
export async function mockDoordashAPI(page: Page): Promise<void> {
  await page.route(/openapi\.doordash\.com/i, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, orders: [] }),
    });
  });
}

/** Stub Uber Eats API when UBER_EATS_E2E_CONNECTION_ID is unset. */
export async function mockUberEatsAPI(page: Page): Promise<void> {
  await page.route(/api\.uber\.com|uber.*eats/i, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, orders: [] }),
    });
  });
}

/** Stub Grubhub API when GRUBHUB_E2E_CONNECTION_ID is unset. */
export async function mockGrubhubAPI(page: Page): Promise<void> {
  await page.route(/grubhub\.com/i, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, orders: [] }),
    });
  });
}
