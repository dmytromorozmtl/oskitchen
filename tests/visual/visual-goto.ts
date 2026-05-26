import { expect, type Page } from "@playwright/test";

/** Navigate to a visual-test page and assert production server returned 200. */
export async function gotoVisualTestPage(page: Page, path: string) {
  const res = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(res?.ok(), `Expected 200 for ${path}, got ${res?.status() ?? "no response"}`).toBeTruthy();
}
