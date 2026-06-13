import { expect, test } from "@playwright/test";

import {
  EXPIRED_SESSION_E2E_POLICY_ID,
  EXPIRED_SESSION_FLOW_STEPS,
  EXPIRED_SESSION_LOGIN_PATH,
  EXPIRED_SESSION_PROTECTED_API_PATH,
  EXPIRED_SESSION_PROTECTED_DASHBOARD_PATH,
  isExpiredSessionLoginRedirect,
  isExpiredSessionUnauthorizedStatus,
} from "@/lib/qa/expired-session-e2e-policy";

/**
 * Expired / missing session negative tests (P3-54).
 *
 * Unauthenticated browser and API requests must not reach protected surfaces.
 */

test.describe("expired session policy", () => {
  test("exports login redirect and unauthorized contract", () => {
    expect(EXPIRED_SESSION_E2E_POLICY_ID).toBe("expired-session-e2e-v1");
    expect(EXPIRED_SESSION_LOGIN_PATH).toBe("/login");
    expect(EXPIRED_SESSION_PROTECTED_DASHBOARD_PATH).toBe("/dashboard/today");
    expect(EXPIRED_SESSION_FLOW_STEPS).toEqual([
      "dashboard_redirects_to_login",
      "api_returns_unauthorized",
    ]);
    expect(isExpiredSessionUnauthorizedStatus(401)).toBe(true);
    expect(isExpiredSessionUnauthorizedStatus(403)).toBe(true);
    expect(isExpiredSessionLoginRedirect("https://app.test/login?next=%2Fdashboard")).toBe(true);
  });
});

test.describe("expired session (chromium — no auth)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "Expired session tests run in unauthenticated chromium project only",
    );
  });

  test("protected dashboard redirects to login without session", async ({ page }) => {
    await page.goto(EXPIRED_SESSION_PROTECTED_DASHBOARD_PATH);
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    expect(isExpiredSessionLoginRedirect(page.url())).toBe(true);
  });

  test("protected API returns unauthorized without session", async ({ request }) => {
    const response = await request.get(EXPIRED_SESSION_PROTECTED_API_PATH);
    expect(isExpiredSessionUnauthorizedStatus(response.status())).toBe(true);
  });
});
