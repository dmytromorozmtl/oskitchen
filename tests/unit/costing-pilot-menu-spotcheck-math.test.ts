import { describe, expect, it } from "vitest";

import {
  buildPilotMarginReportRow,
  marginReportRowConsistent,
  PILOT_MENU_SPOTCHECK_FIXTURE,
  runPilotMenuSpotcheck,
} from "@/lib/costing/costing-pilot-menu-spotcheck-math";

describe("costing pilot menu spotcheck math", () => {
  it("builds deterministic margin rows for pilot menu fixture", () => {
    const chicken = buildPilotMarginReportRow(PILOT_MENU_SPOTCHECK_FIXTURE[0]!);
    expect(chicken.recipeName).toBe("Pilot Chicken Bowl");
    expect(chicken.sellingPrice).toBe(12);
    expect(chicken.foodCostPct).toBe(17.5);
    expect(chicken.marginPct).toBe(55.4);
    expect(chicken.foodCost).toBe(5.35);

    const wrap = buildPilotMarginReportRow(PILOT_MENU_SPOTCHECK_FIXTURE[1]!);
    expect(wrap.recipeName).toBe("Pilot Veg Wrap");
    expect(wrap.foodCostPct).toBe(13.9);
    expect(wrap.marginPct).toBe(67.4);
    expect(wrap.foodCost).toBe(3.1);
  });

  it("validates margin report row internal consistency", () => {
    const result = runPilotMenuSpotcheck();
    expect(result.passed).toBe(true);
    expect(result.inconsistentRecipes).toEqual([]);
    for (const row of result.rows) {
      expect(marginReportRowConsistent(row)).toBe(true);
    }
  });

  it("rejects inconsistent margin row", () => {
    const row = buildPilotMarginReportRow(PILOT_MENU_SPOTCHECK_FIXTURE[0]!);
    expect(marginReportRowConsistent({ ...row, marginPct: 10 })).toBe(false);
  });
});
