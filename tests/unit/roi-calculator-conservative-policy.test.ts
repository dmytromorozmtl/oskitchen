import { describe, expect, it } from "vitest";

import {
  auditRoiCalculatorConservativeDoc,
  computeConservativeRoiMonthly,
  lintRoiCalculatorCopy,
  ROI_CALCULATOR_CONSERVATIVE_POLICY_ID,
  ROI_CALCULATOR_DEFAULT_INPUTS,
  ROI_GROWTH_CONTRIBUTION_PCT,
  ROI_LABOR_HOURS_REDUCTION_PCT,
  ROI_MISTAKE_REDUCTION_PCT,
} from "@/lib/marketing/roi-calculator-conservative-policy";

describe("ROI calculator conservative policy (MKT-25)", () => {
  it("locks MKT-25 policy id and conservative multipliers", () => {
    expect(ROI_CALCULATOR_CONSERVATIVE_POLICY_ID).toBe(
      "roi-calculator-conservative-mkt25-v1",
    );
    expect(ROI_LABOR_HOURS_REDUCTION_PCT).toBe(35);
    expect(ROI_MISTAKE_REDUCTION_PCT).toBe(40);
    expect(ROI_GROWTH_CONTRIBUTION_PCT).toBe(8);
  });

  it("computes default inputs with conservative caps", () => {
    const result = computeConservativeRoiMonthly(ROI_CALCULATOR_DEFAULT_INPUTS);
    expect(result.hoursSavedPerWeek).toBe(4);
    expect(result.recommendedPlan).toBe("Pro");
    expect(Math.round(result.totalMonthly)).toBe(646);
  });

  it("recommends Team plan above 1000 weekly orders", () => {
    const result = computeConservativeRoiMonthly({
      ...ROI_CALCULATOR_DEFAULT_INPUTS,
      weeklyOrders: 1200,
    });
    expect(result.recommendedPlan).toBe("Team");
  });

  it("passes audit on canonical ROI conservative doc", () => {
    const audit = auditRoiCalculatorConservativeDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
  });

  it("flags forbidden ROI guarantee copy", () => {
    const result = lintRoiCalculatorCopy(
      "Guaranteed savings of $5000 with proven ROI and payback in 30 days.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });
});
