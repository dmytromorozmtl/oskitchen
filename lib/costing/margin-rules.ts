import type { BusinessType, MarginRule, ProfitabilityWarningLevel } from "@prisma/client";

import type { CostingWarningReason } from "./costing-types";

export type MarginThresholds = {
  targetMarginPercent: number;
  warningMarginPercent: number;
  foodCostTargetPercent: number | null;
};

function scoreRuleSpecificity(r: Pick<MarginRule, "businessMode" | "productType">): number {
  let s = 0;
  if (r.businessMode) s += 2;
  if (r.productType) s += 1;
  return s;
}

/**
 * Picks the most specific active margin rule, else falls back to kitchen defaults.
 */
export function resolveMarginThresholds(
  rules: MarginRule[],
  businessType: BusinessType | null | undefined,
  productCategory: string,
  kitchenDefaults: MarginThresholds,
): MarginThresholds {
  const active = rules.filter((r) => r.active);
  const candidates = active.filter((r) => {
    const modeOk = !r.businessMode || r.businessMode === businessType;
    const catOk = !r.productType || r.productType === productCategory;
    return modeOk && catOk;
  });
  const pool = candidates.length > 0 ? candidates : active;
  if (pool.length === 0) return kitchenDefaults;
  pool.sort((a, b) => scoreRuleSpecificity(b) - scoreRuleSpecificity(a));
  const top = pool[0]!;
  return {
    targetMarginPercent: Number(top.targetMarginPercent),
    warningMarginPercent: Number(top.warningMarginPercent),
    foodCostTargetPercent: kitchenDefaults.foodCostTargetPercent,
  };
}

export function evaluateProfitabilityWarning(
  grossMarginPercent: number,
  foodCostPercent: number,
  thresholds: MarginThresholds,
): { level: ProfitabilityWarningLevel; reasons: CostingWarningReason[] } {
  const reasons: CostingWarningReason[] = [];
  let level: ProfitabilityWarningLevel = "NONE";

  const push = (code: string, message: string, severity: CostingWarningReason["severity"], next: ProfitabilityWarningLevel) => {
    reasons.push({ code, message, severity });
    const rank = { NONE: 0, INFO: 1, LOW: 2, MEDIUM: 3, HIGH: 4 };
    if (rank[next] > rank[level]) level = next;
  };

  if (grossMarginPercent < thresholds.warningMarginPercent) {
    push(
      "MARGIN_BELOW_WARNING",
      `Modeled gross margin (${grossMarginPercent.toFixed(1)}%) is below your warning threshold (${thresholds.warningMarginPercent.toFixed(1)}%).`,
      "warn",
      grossMarginPercent < thresholds.warningMarginPercent - 10 ? "HIGH" : "MEDIUM",
    );
  } else if (grossMarginPercent < thresholds.targetMarginPercent) {
    push(
      "MARGIN_BELOW_TARGET",
      `Modeled gross margin (${grossMarginPercent.toFixed(1)}%) is below your target (${thresholds.targetMarginPercent.toFixed(1)}%).`,
      "info",
      "LOW",
    );
  }

  if (thresholds.foodCostTargetPercent != null && foodCostPercent > thresholds.foodCostTargetPercent) {
    push(
      "FOOD_COST_ABOVE_TARGET",
      `Food cost % (${foodCostPercent.toFixed(1)}%) exceeds your food cost target (${thresholds.foodCostTargetPercent.toFixed(1)}%).`,
      "info",
      level === "NONE" ? "LOW" : level,
    );
  }

  return { level, reasons };
}
