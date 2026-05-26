import type { ScenarioInputJson, ScenarioResultJson } from "./costing-types";

export type ScenarioBaselineCosts = {
  salePrice: number;
  ingredientCost: number;
  laborCost: number;
  packagingCost: number;
  deliveryCost: number;
  /** 0–100 */
  platformFeePercent: number;
  platformFixedFee: number;
  /** 0–1 fraction e.g. 0.029 */
  paymentFeePercent: number;
  overheadCost: number;
};

function applyDelta(base: number, deltaPercent: number | undefined): number {
  if (deltaPercent == null || !Number.isFinite(deltaPercent)) return base;
  return Math.max(0, base * (1 + deltaPercent / 100));
}

function stackTotal(
  sale: number,
  ing: number,
  lab: number,
  pack: number,
  delivery: number,
  overhead: number,
  platformFeePercent: number,
  platformFixedFee: number,
  paymentFeePercent: number,
): number {
  const platPct = platformFeePercent / 100;
  const plat = Math.max(0, sale * platPct + platformFixedFee);
  const pay = Math.max(0, sale * paymentFeePercent);
  return ing + lab + pack + delivery + overhead + plat + pay;
}

/**
 * What-if margin math — operational estimate only.
 */
export function evaluatePricingScenario(
  baseline: ScenarioBaselineCosts,
  input: ScenarioInputJson,
): ScenarioResultJson {
  const warnings: ScenarioResultJson["warnings"] = [];

  const sale =
    input.salePrice != null && Number.isFinite(input.salePrice) ? input.salePrice : baseline.salePrice;

  const ing = applyDelta(baseline.ingredientCost, input.ingredientCostDeltaPercent);
  const lab = applyDelta(baseline.laborCost, input.laborCostDeltaPercent);
  const pack = applyDelta(baseline.packagingCost, input.packagingCostDeltaPercent);

  const disc = Math.min(95, Math.max(0, input.discountPercent ?? 0)) / 100;
  const effectiveSale = sale * (1 - disc);

  const platPct = input.platformFeePercent ?? baseline.platformFeePercent;
  const platFix = input.platformFixedFee ?? baseline.platformFixedFee;

  const totalCost = stackTotal(
    effectiveSale,
    ing,
    lab,
    pack,
    baseline.deliveryCost,
    baseline.overheadCost,
    platPct,
    platFix,
    baseline.paymentFeePercent,
  );

  const grossProfit = effectiveSale - totalCost;
  const grossMarginPercent = effectiveSale > 0 ? (grossProfit / effectiveSale) * 100 : 0;
  const foodCostPercent = effectiveSale > 0 ? (ing / effectiveSale) * 100 : 0;

  if (effectiveSale <= 0) {
    warnings.push({ code: "NO_SALE", message: "Sale price after discount is zero or negative.", severity: "risk" });
  }
  if (ing === 0) {
    warnings.push({ code: "NO_INGREDIENT_COST", message: "Ingredient cost is zero in this scenario.", severity: "warn" });
  }

  const target = input.targetMarginPercent;
  let suggestedPrice: number | null = null;
  if (target != null && target > 0 && target < 99) {
    const m = target / 100;
    const feeRate = platPct / 100 + baseline.paymentFeePercent;
    const fixedStack =
      ing +
      lab +
      pack +
      baseline.deliveryCost +
      baseline.overheadCost +
      platFix;
    const denom = (1 - disc) * (1 - feeRate - m);
    if (denom > 0.01) {
      suggestedPrice = fixedStack / denom;
    } else {
      warnings.push({
        code: "NO_SOLUTION",
        message: "Target margin is unreachable with the modeled fee and discount stack.",
        severity: "risk",
      });
    }
  }

  const baselineEffectiveSale = baseline.salePrice * (1 - disc);
  const baselineTotal = stackTotal(
    baselineEffectiveSale,
    baseline.ingredientCost,
    baseline.laborCost,
    baseline.packagingCost,
    baseline.deliveryCost,
    baseline.overheadCost,
    baseline.platformFeePercent,
    baseline.platformFixedFee,
    baseline.paymentFeePercent,
  );
  const baselineGross = baselineEffectiveSale - baselineTotal;
  const profitDeltaVsCurrent = grossProfit - baselineGross;

  return {
    salePrice: effectiveSale,
    totalCost,
    grossMarginPercent,
    foodCostPercent,
    suggestedPrice,
    profitDeltaVsCurrent,
    warnings,
  };
}
