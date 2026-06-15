import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

import { expect, test as setup } from "@playwright/test";

const AUTH_STATE = join(process.cwd(), "e2e", ".auth", "staff.json");

/**
 * Staff workspace member session for closed-beta visibility tests (step 5).
 * Requires E2E_STAFF_EMAIL + E2E_STAFF_PASSWORD (different from owner).
 */
setup("authenticate staff dashboard", async ({ page }) => {
  const email = process.env.E2E_STAFF_EMAIL?.trim();
  const password = process.env.E2E_STAFF_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error("E2E_STAFF_EMAIL / E2E_STAFF_PASSWORD must be set for staff setup project.");
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });

  await mkdir(dirname(AUTH_STATE), { recursive: true });
  await page.context().storageState({ path: AUTH_STATE });
});
