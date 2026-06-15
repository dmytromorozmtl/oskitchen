import { expect, test } from "@playwright/test";

test.describe("public knowledge base", () => {
  test("home shows search, sidebar tree, and categories", async ({ page }) => {
    await page.goto("/kb");

    await expect(page.getByTestId("kb-home")).toBeVisible();
    await expect(page.getByTestId("kb-search-input")).toBeVisible();
    await expect(page.getByTestId("kb-sidebar")).toBeVisible();
    await expect(page.getByTestId("kb-category-getting-started")).toBeVisible();
    await expect(page.getByTestId("kb-language-switcher")).toBeVisible();
  });

  test("article page shows breadcrumbs, body, feedback, and related", async ({ page }) => {
    await page.goto("/kb/getting-started/quick-start");

    await expect(page.getByTestId("kb-breadcrumbs")).toBeVisible();
    await expect(page.getByTestId("kb-article")).toBeVisible();
    await expect(page.getByRole("heading", { name: /15-minute quick start/i })).toBeVisible();
    await expect(page.getByTestId("kb-feedback")).toBeVisible();
    await expect(page.getByTestId("kb-related-articles")).toBeVisible();
  });

  test("search finds billing articles", async ({ page }) => {
    await page.goto("/kb?q=pricing");

    await expect(page.getByTestId("kb-search-results")).toBeVisible();
    await expect(page.getByText(/plans, trials, and self-serve/i)).toBeVisible();
  });

  test("french locale stub switches article title", async ({ page }) => {
    await page.goto("/kb/getting-started/quick-start?lang=fr");

    await expect(page.getByRole("heading", { name: /assistant quick start/i })).toBeVisible();
  });

  test("feedback buttons are clickable", async ({ page }) => {
    await page.goto("/kb/billing/plans-and-trials");

    await page.getByTestId("kb-feedback-up").click();
    await expect(page.getByTestId("kb-feedback-stats")).toBeVisible({ timeout: 10_000 });
  });
});
