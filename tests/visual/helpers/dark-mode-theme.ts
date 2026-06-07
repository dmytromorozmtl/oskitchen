import type { Page } from "@playwright/test";

import type { VisualRegressionThemeMode } from "@/lib/testing/visual-regression-dark-mode-policy";

/** Apply next-themes class + prefers-color-scheme before and after navigation. */
export async function applyVisualTheme(page: Page, theme: VisualRegressionThemeMode) {
  await page.emulateMedia({ colorScheme: theme });
  await page.addInitScript((mode: string) => {
    window.localStorage.setItem("theme", mode);
  }, theme);
}

export async function assertVisualThemeApplied(page: Page, theme: VisualRegressionThemeMode) {
  await page.evaluate((mode) => {
    window.localStorage.setItem("theme", mode);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(mode);
    root.style.colorScheme = mode;
  }, theme);

  await page.waitForFunction(
    (mode) => document.documentElement.classList.contains(mode),
    theme,
    { timeout: 5_000 },
  );
}
