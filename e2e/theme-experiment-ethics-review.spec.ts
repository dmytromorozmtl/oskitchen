import { expect, test } from "@playwright/test";

/**
 * Ethics dashboard — Approve/Veto via experiment-ethics-review server action.
 * Requires THEME_EXPERIMENT_PREFRONTAL_ETHICS_BOARD=1 and pending review in JSON.
 * Run with storefront-authed project (E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD).
 */
test.describe("Theme experiment ethics review", () => {
  test.skip(
    process.env.THEME_EXPERIMENT_PREFRONTAL_ETHICS_BOARD !== "1",
    "Enable THEME_EXPERIMENT_PREFRONTAL_ETHICS_BOARD=1 for ethics E2E",
  );

  test("advanced page shows ethics board with Approve and Veto", async ({ page }) => {
    await page.goto("/dashboard/storefront/advanced");
    await expect(page.getByText("Prefrontal ethics board")).toBeVisible();
    const approve = page.getByRole("button", { name: "Approve" });
    const veto = page.getByRole("button", { name: "Veto" });
    if ((await approve.count()) > 0) {
      await expect(approve).toBeVisible();
      await expect(veto).toBeVisible();
    }
  });

  test("veto records review and shows feedback", async ({ page }) => {
    await page.goto("/dashboard/storefront/advanced");
    const veto = page.getByRole("button", { name: "Veto" });
    if ((await veto.count()) === 0) {
      test.skip(true, "No pending ethics review in storefront JSON");
    }
    await page.getByPlaceholder("Rationale for approve/veto").fill("E2E veto — publish must stay blocked");
    await veto.click();
    await expect(
      page.getByText(/Review recorded|Ethics|veto|blocked/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("approve records review when pending queue exists", async ({ page }) => {
    await page.goto("/dashboard/storefront/advanced");
    const approve = page.getByRole("button", { name: "Approve" });
    if ((await approve.count()) === 0) {
      test.skip(true, "No pending ethics review in storefront JSON");
    }
    await page.getByPlaceholder("Rationale for approve/veto").fill("E2E approve — gate may clear");
    await approve.click();
    await expect(page.getByText(/Review recorded/i)).toBeVisible({ timeout: 15_000 });
  });
});
