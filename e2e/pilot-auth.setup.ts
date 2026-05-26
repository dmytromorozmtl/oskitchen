import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

import { expect, test as setup } from "@playwright/test";

const AUTH_STATE = join(process.cwd(), "e2e", ".auth", "pilot-owner.json");

/**
 * Paid-pilot owner session (`pilot-journey` Playwright project).
 * Requires E2E_PILOT_EMAIL, E2E_PILOT_PASSWORD, PLAYWRIGHT_BASE_URL.
 */
setup("authenticate pilot owner", async ({ page }) => {
  const email = process.env.E2E_PILOT_EMAIL?.trim();
  const password = process.env.E2E_PILOT_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error("E2E_PILOT_EMAIL / E2E_PILOT_PASSWORD must be set when pilot-setup runs.");
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 60_000 });

  if (page.url().includes("/onboarding")) {
    const skipSetup = page.getByRole("button", { name: /skip setup/i });
    if (await skipSetup.isVisible().catch(() => false)) {
      await skipSetup.click();
    } else {
      await page.getByRole("button", { name: /skip onboarding/i }).click();
    }
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });
  } else {
    await expect(page).toHaveURL(/\/dashboard/);
  }

  await mkdir(dirname(AUTH_STATE), { recursive: true });
  await page.context().storageState({ path: AUTH_STATE });
});
