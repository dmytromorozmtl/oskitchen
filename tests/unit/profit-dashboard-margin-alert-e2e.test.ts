import { describe, expect, it } from "vitest";

import {
  MARGIN_ALERT_ACCURACY_TOLERANCE_PERCENT,
  PROFIT_DASHBOARD_MARGIN_ALERT_E2E_POLICY_ID,
  PROFIT_DASHBOARD_PATH,
  PROFIT_REFRESH_SECONDS,
  displayedGaugeMarginMatchesSnapshot,
  extractMarginPercentsFromText,
  marginAlertReferencesSnapshotMargin,
  marginPercentWithinTolerance,
  parseGaugeMarginPercent,
} from "@/lib/analytics/profit-dashboard-margin-alert-e2e-policy";
import { MARGIN_ACCURACY_TOLERANCE_PERCENT } from "@/tests/unit/profit-margin-accuracy.test";
import { generateProfitAlerts, marginZone } from "@/services/analytics/profit-alerts";

describe("Profit dashboard margin alert E2E lifecycle (QA-22)", () => {
  it("exports E2E policy id and shares QA-09 margin tolerance", () => {
    expect(PROFIT_DASHBOARD_MARGIN_ALERT_E2E_POLICY_ID).toBe(
      "profit-dashboard-margin-alert-e2e-v1",
    );
    expect(PROFIT_DASHBOARD_PATH).toBe("/dashboard/today/profit");
    expect(MARGIN_ALERT_ACCURACY_TOLERANCE_PERCENT).toBe(MARGIN_ACCURACY_TOLERANCE_PERCENT);
    expect(PROFIT_REFRESH_SECONDS).toBe(60);
  });

  it("parses gauge aria-label margin for display accuracy checks", () => {
    expect(parseGaugeMarginPercent("Margin gauge 55 percent")).toBe(55);
    expect(displayedGaugeMarginMatchesSnapshot(55, 55.9)).toBe(true);
    expect(displayedGaugeMarginMatchesSnapshot(55, 57)).toBe(false);
  });

  it("margin alert messages reference computed margin within ±1%", () => {
    const marginPercent = 41.7;
    const alerts = generateProfitAlerts({
      marginPercent,
      previousMarginPercent: 52,
      laborPercent: 31,
      targetLaborPercent: 30,
      deliveryCost: 80,
      revenue: 1500,
      foodCostPercent: 34,
      targetFoodCostPercent: 32,
    });

    for (const alert of alerts) {
      expect(
        marginAlertReferencesSnapshotMargin(alert.id, alert.message, marginPercent),
      ).toBe(true);
    }

    const marginDrop = alerts.find((alert) => alert.id === "margin_drop");
    expect(extractMarginPercentsFromText(marginDrop!.message).length).toBeGreaterThan(0);
  });

  it("margin zone classification matches alert thresholds", () => {
    expect(marginZone(55)).toBe("green");
    expect(marginZone(45)).toBe("yellow");
    expect(marginZone(35)).toBe("red");
    expect(marginPercentWithinTolerance(45, 44.2)).toBe(true);
  });
});
