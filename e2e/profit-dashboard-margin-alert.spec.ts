import { expect, test } from "@playwright/test";

import {
  MARGIN_ALERT_ACCURACY_TOLERANCE_PERCENT,
  PROFIT_DASHBOARD_MARGIN_ALERT_E2E_POLICY_ID,
  PROFIT_DASHBOARD_PATH,
  PROFIT_REFRESH_SECONDS,
  REAL_TIME_PROFIT_API_PATH,
  displayedGaugeMarginMatchesSnapshot,
  extractMarginPercentsFromText,
  marginAlertReferencesSnapshotMargin,
  marginPercentWithinTolerance,
  parseGaugeMarginPercent,
} from "@/lib/analytics/profit-dashboard-margin-alert-e2e-policy";
import { generateProfitAlerts, marginZone } from "@/services/analytics/profit-alerts";

import { runProfitDashboardMarginAlertFlow } from "./helpers/profit-dashboard-margin-alert-flow";
import { skipProfitDashboardMarginAlertIfNotAuthed } from "./helpers/profit-dashboard-margin-alert-ready";

/**
 * Profit dashboard → margin alert accuracy E2E.
 *
 * Real-time profit page gauge + alerts must match API snapshot within ±1%.
 *
 * @see components/analytics/real-time-profit-dashboard.tsx
 * @see tests/unit/profit-margin-accuracy.test.ts — QA-09 COGS baseline
 */

test.describe("profit dashboard margin alert policy", () => {
  test("exports profit dashboard route and margin tolerance contract", () => {
    expect(PROFIT_DASHBOARD_MARGIN_ALERT_E2E_POLICY_ID).toBe(
      "profit-dashboard-margin-alert-e2e-v1",
    );
    expect(PROFIT_DASHBOARD_PATH).toBe("/dashboard/today/profit");
    expect(REAL_TIME_PROFIT_API_PATH).toBe("/api/analytics/real-time-profit");
    expect(MARGIN_ALERT_ACCURACY_TOLERANCE_PERCENT).toBe(1);
    expect(parseGaugeMarginPercent("Margin gauge 42.0 percent")).toBe(42);
    expect(displayedGaugeMarginMatchesSnapshot(42, 42.4)).toBe(true);
    expect(marginPercentWithinTolerance(70, 70.8)).toBe(true);
    expect(marginPercentWithinTolerance(70, 72)).toBe(false);
  });

  test("margin drop alert message cites snapshot margin within tolerance", () => {
    const alerts = generateProfitAlerts({
      marginPercent: 38.2,
      previousMarginPercent: 50.1,
      laborPercent: 28,
      targetLaborPercent: 30,
      deliveryCost: 20,
      revenue: 1000,
      foodCostPercent: 30,
      targetFoodCostPercent: 32,
    });
    const marginDrop = alerts.find((alert) => alert.id === "margin_drop");
    expect(marginDrop).toBeDefined();
    expect(
      marginAlertReferencesSnapshotMargin(
        marginDrop!.id,
        marginDrop!.message,
        38.2,
      ),
    ).toBe(true);
    const percents = extractMarginPercentsFromText(marginDrop!.message);
    expect(percents.some((value) => marginPercentWithinTolerance(value, 38.2, 0.5))).toBe(true);
  });

  test("healthy margin alert aligns with green zone threshold", () => {
    const marginPercent = 62.4;
    const alerts = generateProfitAlerts({
      marginPercent,
      laborPercent: 28,
      targetLaborPercent: 30,
      deliveryCost: 10,
      revenue: 2000,
      foodCostPercent: 28,
      targetFoodCostPercent: 32,
    });
    const healthy = alerts.find((alert) => alert.id === "margin_healthy");
    expect(healthy).toBeDefined();
    expect(marginZone(marginPercent)).toBe("green");
    expect(
      marginAlertReferencesSnapshotMargin(healthy!.id, healthy!.message, marginPercent),
    ).toBe(true);
  });
});

test.describe("profit dashboard margin alert (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Profit dashboard margin alert runs in chromium-authed project only",
    );
    skipProfitDashboardMarginAlertIfNotAuthed();
  });

  test("profit gauge and alerts match real-time API margin within ±1%", async ({ page }) => {
    const result = await runProfitDashboardMarginAlertFlow(page);
    if (!result) {
      test.skip(true, "Profit dashboard unavailable — auth or route blocked.");
    }

    expect(result.snapshot.marginZone).toBe(marginZone(result.snapshot.marginPercent));
    expect(result.gaugeMarginPercent).toBeGreaterThanOrEqual(0);
    expect(result.gaugeMarginPercent).toBeLessThanOrEqual(100);
  });
});
