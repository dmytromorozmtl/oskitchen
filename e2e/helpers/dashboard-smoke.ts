import { expect, test, type Page } from "@playwright/test";

const RSC_FAILURE_PATTERNS = [
  /Something went wrong/i,
  /An error occurred in the Server Components render/i,
  /Application error: a server-side exception has occurred/i,
  /Internal Server Error/i,
  /digest:/i,
  /Minified React error/i,
] as const;

export async function skipIfLoginRedirect(page: Page, label = "Dashboard auth required"): Promise<void> {
  if (page.url().includes("/login")) {
    test.skip(true, label);
  }
}

export async function assertNoDashboardRscFailure(page: Page): Promise<void> {
  const body = page.locator("body");
  for (const pattern of RSC_FAILURE_PATTERNS) {
    await expect(body, `RSC failure pattern ${pattern}`).not.toContainText(pattern);
  }
  await expect(body).not.toContainText(/POS terminal unavailable/i);
}
