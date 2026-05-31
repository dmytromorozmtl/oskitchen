import { test, type Page } from "@playwright/test";

export async function skipIfLoginRedirect(page: Page, label = "Dashboard auth required"): Promise<void> {
  if (page.url().includes("/login")) {
    test.skip(true, label);
  }
}
