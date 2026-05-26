import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Unauthenticated shell pages — safe for CI without dashboard secrets. */
const AUTH_SHELL_PATHS = ["/login", "/signup", "/forgot-password"];

for (const path of AUTH_SHELL_PATHS) {
  test(`a11y auth shell: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    expect(serious, `a11y violations on ${path}`).toEqual([]);
  });
}
