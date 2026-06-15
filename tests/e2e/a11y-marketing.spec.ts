import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility smoke on revenue-critical marketing paths.
 * Fails on serious/critical violations — tune rules as needed.
 */
const MARKETING_PATHS = [
  "/",
  "/pricing",
  "/roi-calculator",
  "/book-demo",
  "/compare/toast",
  "/compare/deliverect",
  "/solutions/meal-prep",
  "/blog/meal-prep-order-queue-cut-packing-errors",
  "/deck",
];

for (const path of MARKETING_PATHS) {
  test(`a11y: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    if (serious.length > 0) {
      console.log(JSON.stringify(serious, null, 2));
    }

    expect(serious, `a11y violations on ${path}`).toEqual([]);
  });
}
