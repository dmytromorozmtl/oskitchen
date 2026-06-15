/**
 * MKT-25 — conservative ROI calculator policy.
 *
 * Single source of truth for /roi-calculator multipliers and sales guardrails.
 *
 * @see docs/roi-calculator-conservative.md
 * @see docs/ROI_CALCULATOR_LOGIC.md
 * @see components/marketing/roi-calculator.tsx
 */

export const ROI_CALCULATOR_CONSERVATIVE_POLICY_ID =
  "roi-calculator-conservative-mkt25-v1" as const;

export const ROI_CALCULATOR_CONSERVATIVE_DOC =
  "docs/roi-calculator-conservative.md" as const;

/** Weeks per month proxy for labor value. */
export const ROI_WEEKS_PER_MONTH = 4.33 as const;

/** Conservative: max share of manual coordination hours reducible via OS Kitchen. */
export const ROI_LABOR_HOURS_REDUCTION_PCT = 35 as const;

/** Conservative: max share of mistake/refund loss reducible. */
export const ROI_MISTAKE_REDUCTION_PCT = 40 as const;

/** Conservative: growth uplift modeled as 8% contribution proxy — not revenue guarantee. */
export const ROI_GROWTH_CONTRIBUTION_PCT = 8 as const;

export type RoiCalculatorInputs = {
  weeklyOrders: number;
  averageOrderValue: number;
  manualCoordinationHoursPerWeek: number;
  hourlyAdminCost: number;
  monthlyMistakesOrRefunds: number;
  expectedGrowthPct: number;
};

export type RoiCalculatorOutputs = {
  hoursSavedPerWeek: number;
  laborValueMonthly: number;
  mistakeReductionMonthly: number;
  growthContributionMonthly: number;
  totalMonthly: number;
  recommendedPlan: "Starter" | "Pro" | "Team";
};

export const ROI_PLAN_THRESHOLDS = {
  teamMinWeeklyOrders: 1000,
  proMinWeeklyOrders: 100,
} as const;

export const ROI_CALCULATOR_DEFAULT_INPUTS: RoiCalculatorInputs = {
  weeklyOrders: 250,
  averageOrderValue: 18,
  manualCoordinationHoursPerWeek: 12,
  hourlyAdminCost: 25,
  monthlyMistakesOrRefunds: 8,
  expectedGrowthPct: 10,
} as const;

export const ROI_CALCULATOR_DISCLAIMER =
  "Conservative estimate, not a guarantee." as const;

export const ROI_CALCULATOR_PRIMARY_CTA = {
  label: "Book ROI walkthrough",
  href: "/book-demo?utm_source=roi&utm_medium=calculator&utm_campaign=roi-conservative-mkt25",
} as const;

export const ROI_CALCULATOR_FORBIDDEN_PHRASES = [
  "guaranteed savings",
  "guaranteed roi",
  "guaranteed return",
  "proven roi",
  "will save you",
  "you will earn",
  "payback in 30 days",
  "payback in 60 days",
  "100% accurate",
  "audited savings",
] as const;

export const ROI_CALCULATOR_CONSERVATIVE_REQUIRED_HEADINGS = [
  "Conservative assumptions",
  "Input definitions",
  "Output definitions",
  "Worked examples by segment",
  "Sales presentation script",
  "Forbidden ROI claims",
  "Pre-demo checklist",
] as const;

export function recommendPlanFromWeeklyOrders(
  weeklyOrders: number,
): RoiCalculatorOutputs["recommendedPlan"] {
  if (weeklyOrders > ROI_PLAN_THRESHOLDS.teamMinWeeklyOrders) return "Team";
  if (weeklyOrders > ROI_PLAN_THRESHOLDS.proMinWeeklyOrders) return "Pro";
  return "Starter";
}

export function computeConservativeRoiMonthly(
  inputs: RoiCalculatorInputs,
): RoiCalculatorOutputs {
  const hoursSavedPerWeek = Math.round(
    inputs.manualCoordinationHoursPerWeek * (ROI_LABOR_HOURS_REDUCTION_PCT / 100),
  );
  const laborValueMonthly = hoursSavedPerWeek * inputs.hourlyAdminCost * ROI_WEEKS_PER_MONTH;
  const mistakeReductionMonthly =
    inputs.monthlyMistakesOrRefunds *
    inputs.averageOrderValue *
    (ROI_MISTAKE_REDUCTION_PCT / 100);
  const growthContributionMonthly =
    inputs.weeklyOrders *
    (inputs.expectedGrowthPct / 100) *
    inputs.averageOrderValue *
    ROI_WEEKS_PER_MONTH *
    (ROI_GROWTH_CONTRIBUTION_PCT / 100);

  const totalMonthly =
    laborValueMonthly + mistakeReductionMonthly + growthContributionMonthly;

  return {
    hoursSavedPerWeek,
    laborValueMonthly,
    mistakeReductionMonthly,
    growthContributionMonthly,
    totalMonthly,
    recommendedPlan: recommendPlanFromWeeklyOrders(inputs.weeklyOrders),
  };
}
