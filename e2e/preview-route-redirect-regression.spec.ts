import { expect, test } from "@playwright/test";

import {
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_FLOW_STEPS,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_POLICY_ID,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ROUTES,
  isPreviewRouteRedirectRegressionE2EEnabled,
} from "@/lib/qa/preview-route-redirect-regression-p2-52-policy";
import { runPreviewRouteRedirectRegression } from "@/lib/qa/preview-route-redirect-regression-flow";

import { assertLivePreviewRouteRedirect } from "./helpers/preview-route-redirect-regression-flow";

/**
 * Preview route redirect regression — blocked preview URLs preserve deep links.
 *
 * @see docs/preview-route-redirect-regression-p2-52.md
 */

test.describe("preview route redirect regression policy (contract)", () => {
  test("locks P2-52 policy and four-step redirect chain", () => {
    expect(PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_POLICY_ID).toBe(
      "preview-route-redirect-regression-p2-52-v1",
    );
    expect(PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_FLOW_STEPS).toEqual([
      "blocked_route",
      "preview_redirect",
      "redirect_param",
      "login_return_path",
    ]);
  });

  test("all canonical routes pass middleware redirect regression", () => {
    const results = runPreviewRouteRedirectRegression([
      ...PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ROUTES,
    ]);
    expect(results.every((row) => row.passed)).toBe(true);
  });

  test("E2E gate requires E2E_PREVIEW_ROUTE_REDIRECT flag", () => {
    const original = process.env.E2E_PREVIEW_ROUTE_REDIRECT;
    delete process.env.E2E_PREVIEW_ROUTE_REDIRECT;
    expect(isPreviewRouteRedirectRegressionE2EEnabled()).toBe(false);
    process.env.E2E_PREVIEW_ROUTE_REDIRECT = "true";
    expect(isPreviewRouteRedirectRegressionE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_PREVIEW_ROUTE_REDIRECT = original;
    else delete process.env.E2E_PREVIEW_ROUTE_REDIRECT;
  });
});

test.describe("preview route redirect regression (live browser)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      !isPreviewRouteRedirectRegressionE2EEnabled(),
      "Live preview redirect E2E requires E2E_PREVIEW_ROUTE_REDIRECT=true",
    );
    test.skip(
      testInfo.project.name !== "chromium",
      "Live preview redirect E2E runs in chromium project only",
    );
  });

  for (const route of PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ROUTES) {
    test(`redirect preserves deep link for ${route}`, async ({ page }) => {
      await assertLivePreviewRouteRedirect(page, route);
    });
  }
});
