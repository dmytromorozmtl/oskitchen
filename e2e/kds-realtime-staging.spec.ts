import { expect, test } from "@playwright/test";

/**
 * Staging-only KDS browser smoke (chromium-authed project).
 *
 * Prerequisites: `E2E_LOGIN_*`, `ENABLE_KDS_V1_CERTIFIED=true` (non-production),
 * tenant in daily-service operating mode with kitchen.view permission.
 *
 * Does NOT certify rush-hour load or production Realtime SLO — page-load + connection
 * status line only. Policy: `era11-kds-realtime-e2e-staging-v1`.
 *
 * @see docs/kds-staging-smoke-checklist.md Tier E
 */

const kdsGateEnabled =
  process.env.NODE_ENV === "production" ||
  process.env.ENABLE_KDS_V1_CERTIFIED === "true";

test.describe("KDS realtime staging browser smoke", () => {
  test.beforeEach(() => {
    test.skip(
      !kdsGateEnabled,
      "Set ENABLE_KDS_V1_CERTIFIED=true for non-production KDS v1 gate",
    );
  });

  test("daily kitchen display loads with connection status", async ({ page }) => {
    await page.goto("/dashboard/kitchen");
    await expect(page.locator("body")).not.toContainText(/Something went wrong/i);
    await expect(page.locator("body")).not.toContainText(
      /An error occurred in the Server Components render/i,
    );

    const kitchenDisplay = page.getByRole("heading", { name: /^Kitchen Display$/i });
    const kdsPilotGate = page.getByText(/KDS v1 pilot/i);
    const permissionDenied = page.getByText(/do not have permission to view kitchen display/i);

    await expect(kitchenDisplay.or(kdsPilotGate).or(permissionDenied)).toBeVisible({
      timeout: 15_000,
    });

    if (await kitchenDisplay.isVisible()) {
      await expect(
        page.getByText(/Live \(Supabase Realtime\)|Polling fallback \(15s\)/),
      ).toBeVisible();
      await expect(
        page.getByLabel(/Enable kitchen sound alerts|Disable kitchen sound alerts/),
      ).toBeVisible();
    }
  });
});
