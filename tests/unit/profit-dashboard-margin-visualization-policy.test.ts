import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildItemMarginBarRows,
  buildProfitMarginStackSegments,
  MARGIN_VIZ_GREEN_MIN,
  MARGIN_VIZ_YELLOW_MIN,
  marginBarClassForZone,
  PROFIT_DASHBOARD_MARGIN_VIZ_POLICY_ID,
  summarizeMarginStackSegments,
} from "@/lib/analytics/profit-dashboard-margin-visualization-policy";
import { marginZone } from "@/services/analytics/profit-alerts";

const ROOT = process.cwd();

describe("profit dashboard margin visualization policy (DES-19)", () => {
  it("locks DES-19 policy id and zone thresholds", () => {
    expect(PROFIT_DASHBOARD_MARGIN_VIZ_POLICY_ID).toBe("profit-dashboard-margin-viz-des19-v1");
    expect(MARGIN_VIZ_GREEN_MIN).toBe(55);
    expect(MARGIN_VIZ_YELLOW_MIN).toBe(40);
  });

  it("builds revenue stack segments that sum to ~100%", () => {
    const segments = buildProfitMarginStackSegments({
      revenue: 1000,
      foodCost: 320,
      laborCost: 280,
      deliveryCost: 45,
      profit: 355,
    });
    const { totalPercent } = summarizeMarginStackSegments(segments);
    expect(segments.map((s) => s.id)).toEqual(["food", "labor", "delivery", "profit"]);
    expect(totalPercent).toBeGreaterThanOrEqual(99);
    expect(totalPercent).toBeLessThanOrEqual(101);
  });

  it("labels loss segment when profit is negative", () => {
    const segments = buildProfitMarginStackSegments({
      revenue: 500,
      foodCost: 300,
      laborCost: 200,
      deliveryCost: 50,
      profit: -50,
    });
    const profitSegment = segments.find((s) => s.id === "profit");
    expect(profitSegment?.label).toBe("Loss");
    expect(profitSegment?.percent).toBeLessThan(0);
  });

  it("builds item margin bars with zone colors", () => {
    const rows = buildItemMarginBarRows([
      { productId: "a", title: "Burger", revenue: 100, marginPercent: 62, units: 10 },
      { productId: "b", title: "Fries", revenue: 40, marginPercent: 38, units: 8 },
    ]);
    expect(rows[0]?.zone).toBe(marginZone(62));
    expect(marginBarClassForZone(rows[0]!.zone)).toBe("bg-emerald-500 dark:bg-emerald-400");
    expect(rows[1]?.zone).toBe("red");
  });

  it("wires margin visualization into profit dashboard", () => {
    const dashboard = readFileSync(
      join(ROOT, "components/analytics/real-time-profit-dashboard.tsx"),
      "utf8",
    );
    expect(dashboard).toContain("ProfitMarginBreakdownBar");
    expect(dashboard).toContain("ProfitItemMarginBars");
  });
});
