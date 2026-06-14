import { expect, type Page } from "@playwright/test";

import { PREVIEW_ROUTE_GUARD_REDIRECT_PATH } from "@/lib/navigation/preview-route-guard-policy";

export async function assertLivePreviewRouteRedirect(
  page: Page,
  sourcePath: string,
): Promise<void> {
  const response = await page.goto(sourcePath, { waitUntil: "commit" });
  expect(response?.status()).toBeLessThan(400);

  const url = new URL(page.url());
  expect(url.pathname).toBe(PREVIEW_ROUTE_GUARD_REDIRECT_PATH);
  expect(url.searchParams.get("preview")).toBe("blocked");
  expect(url.searchParams.get("redirect")).toBe(sourcePath);
}
