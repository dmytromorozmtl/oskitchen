import { describe, expect, it } from "vitest";

import { generateProfitAlerts, marginZone } from "@/services/analytics/profit-alerts";

describe("profit alerts", () => {
  it("classifies margin zones", () => {
    expect(marginZone(60)).toBe("green");
    expect(marginZone(45)).toBe("yellow");
    expect(marginZone(30)).toBe("red");
  });

  it("fires margin drop and labor spike alerts", () => {
    const alerts = generateProfitAlerts({
      marginPercent: 38,
      previousMarginPercent: 50,
      laborPercent: 38,
      targetLaborPercent: 30,
      deliveryCost: 120,
      revenue: 1000,
      foodCostPercent: 35,
      targetFoodCostPercent: 32,
    });
    expect(alerts.some((a) => a.id === "margin_drop")).toBe(true);
    expect(alerts.some((a) => a.id === "labor_spike")).toBe(true);
  });
});
