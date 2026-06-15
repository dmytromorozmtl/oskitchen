import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

import { expect, test as setup } from "@playwright/test";

const AUTH_STATE = join(process.cwd(), "e2e", ".auth", "user.json");

/**
 * Runs only in the `setup` project when dashboard E2E is enabled (see `playwright.config.ts`).
 * Writes storage state for `chromium-authed` — keeps login off the hot path for each test.
 */
setup("authenticate dashboard", async ({ page }) => {
  const email = process.env.E2E_LOGIN_EMAIL?.trim();
  const password = process.env.E2E_LOGIN_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error("E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD must be set when setup project runs.");
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });

  await mkdir(dirname(AUTH_STATE), { recursive: true });
  await page.context().storageState({ path: AUTH_STATE });
});
