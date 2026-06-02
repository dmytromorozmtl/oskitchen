import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Unified accessibility auto-test (Task 77) — axe-core WCAG 2.1 AA gate on public paths.
 * Fails on serious/critical violations. See docs/accessibility-audit.md.
 */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] as const;

/** Revenue-critical marketing + ICP landings (incl. SEO audit gaps). */
const PUBLIC_MARKETING_PATHS = [
  "/",
  "/pricing",
  "/shopify",
  "/vendor",
  "/roi-calculator",
  "/book-demo",
  "/compare/toast",
  "/compare/deliverect",
  "/solutions/meal-prep",
  "/blog/meal-prep-order-queue-cut-packing-errors",
  "/deck",
] as const;

/** Unauthenticated auth shell — safe for CI without dashboard secrets. */
const AUTH_SHELL_PATHS = ["/login", "/signup", "/forgot-password"] as const;

async function expectNoSeriousA11yViolations(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState("domcontentloaded");

  const results = await new AxeBuilder({ page }).withTags([...WCAG_TAGS]).analyze();

  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );

  if (serious.length > 0) {
    console.log(JSON.stringify(serious, null, 2));
  }

  expect(serious, `a11y violations on ${path}`).toEqual([]);
}

test.describe("accessibility — public marketing", () => {
  for (const path of PUBLIC_MARKETING_PATHS) {
    test(`axe: ${path}`, async ({ page }) => {
      await expectNoSeriousA11yViolations(page, path);
    });
  }
});

test.describe("accessibility — auth shell", () => {
  for (const path of AUTH_SHELL_PATHS) {
    test(`axe: ${path}`, async ({ page }) => {
      await expectNoSeriousA11yViolations(page, path);
    });
  }
});
