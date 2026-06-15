import { expect, test } from "@playwright/test";

/**
 * Multi-store admin switcher (requires auth setup + 2+ storefronts on account).
 */
test.describe("Storefront phase 9 — multi-store switcher", () => {
  test.beforeEach(() => {
    test.skip(
      !process.env.E2E_LOGIN_EMAIL?.trim(),
      "Set E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD for dashboard E2E",
    );
  });

  test("workspace lists multiple storefronts when seeded", async ({ page }) => {
    await page.goto("/dashboard/storefront/workspace");
    await expect(page.getByRole("heading", { name: /workspace|storefront/i }).first()).toBeVisible({
      timeout: 60_000,
    });

    const switcher = page.locator("#kos-store-switcher");
    const optionCount = await switcher.locator("option").count();
    if (optionCount < 2) {
      test.skip(true, "Need 2+ storefronts on owner account — create via /dashboard/storefront/workspace");
    }
    expect(optionCount).toBeGreaterThanOrEqual(2);
  });

  test("switching active storefront updates kos_admin_storefront_id cookie", async ({ page, context }) => {
    await page.goto("/dashboard/storefront");
    const switcher = page.locator("#kos-store-switcher");
    test.skip((await switcher.count()) === 0, "Multi-store switcher not visible (single store)");

    const options = switcher.locator("option");
    const count = await options.count();
    test.skip(count < 2, "Need 2+ stores");

    const secondValue = await options.nth(1).getAttribute("value");
    expect(secondValue).toBeTruthy();

    await switcher.selectOption(secondValue!);
    await page.waitForTimeout(500);

    const cookies = await context.cookies();
    const adminCookie = cookies.find((c) => c.name === "kos_admin_storefront_id");
    expect(adminCookie?.value).toBe(secondValue);
  });

  test("audit export CSV endpoint returns text/csv when authed", async ({ page, request }) => {
    await page.goto("/dashboard/storefront/team/audit");
    await expect(page.getByRole("heading", { name: /invite audit/i })).toBeVisible({ timeout: 60_000 });

    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await request.get("/api/dashboard/storefront/team-invite-audit-export", {
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    });

    if (res.status() === 400) {
      test.skip(true, "Workspace not linked — link workspace for audit export.");
    }
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/csv");
    const body = await res.text();
    expect(body).toMatch(/^id,created_at_utc,event_type/);
  });
});
