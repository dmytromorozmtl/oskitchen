import { expect, test, type Page, type Response } from "@playwright/test";

import {
  assertNoDashboardRscFailure,
  skipIfLoginRedirect,
} from "./helpers/dashboard-smoke";

/**
 * Dashboard RSC regression — critical operator surfaces must not 500.
 *
 * Covers the three routes that triggered production RSC incidents (June 2026):
 * `/dashboard/today`, `/dashboard/marketplace`, `/dashboard/pos/terminal`.
 *
 * Runs in `chromium-authed` (requires E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD).
 *
 * @see e2e/dashboard-auth.spec.ts
 * @see scripts/debug-dashboard-rsc-prod.ts
 * @see docs/SPRINT_28_PRODUCTION_HOTFIXES.md
 */

type DashboardRscTarget = {
  path: string;
  label: string;
  /** At least one visible heading when the page renders without server crash. */
  heading: RegExp;
};

const DASHBOARD_RSC_TARGETS: DashboardRscTarget[] = [
  {
    path: "/dashboard/today",
    label: "Today command center",
    heading: /^Today$|^Today overview unavailable$/i,
  },
  {
    path: "/dashboard/marketplace",
    label: "Marketplace hub",
    heading: /^Marketplace$|^Workspace required$|^Marketplace temporarily unavailable$/i,
  },
  {
    path: "/dashboard/pos/terminal",
    label: "POS terminal",
    heading: /^POS terminal$/i,
  },
];

function trackServerFailures(page: Page): {
  stop: () => void;
  failures: Array<{ status: number; url: string }>;
} {
  const failures: Array<{ status: number; url: string }> = [];
  const handler = (response: Response) => {
    const status = response.status();
    if (status < 500) return;
    const url = response.url();
    if (!url.includes("/dashboard")) return;
    failures.push({ status, url });
  };
  page.on("response", handler);
  return {
    failures,
    stop: () => page.off("response", handler),
  };
}

async function loadDashboardRscRoute(page: Page, target: DashboardRscTarget) {
  const tracker = trackServerFailures(page);
  try {
    const response = await page.goto(target.path, { waitUntil: "domcontentloaded" });
    await skipIfLoginRedirect(page, `${target.label}: auth session missing`);

    const status = response?.status() ?? 200;
    expect(status, `${target.path} document response`).toBeLessThan(500);
    expect(tracker.failures, `${target.path} sub-requests`).toEqual([]);

    await assertNoDashboardRscFailure(page);
    await expect(page.getByRole("heading", { name: target.heading }).first()).toBeVisible({
      timeout: 20_000,
    });
  } finally {
    tracker.stop();
  }
}

test.describe("dashboard RSC regression", () => {
  for (const target of DASHBOARD_RSC_TARGETS) {
    test(`${target.label} (${target.path}) — no HTTP 500 or RSC crash`, async ({ page }) => {
      await loadDashboardRscRoute(page, target);
    });
  }

  test("today RSC flight requests stay below 500", async ({ page }) => {
    const tracker = trackServerFailures(page);
    try {
      await page.goto("/dashboard/today", { waitUntil: "networkidle" });
      await skipIfLoginRedirect(page, "Today RSC flight: auth session missing");
      await assertNoDashboardRscFailure(page);
      expect(tracker.failures).toEqual([]);
    } finally {
      tracker.stop();
    }
  });
});
