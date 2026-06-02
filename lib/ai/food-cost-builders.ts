import {
  foodCostPercent,
  grossMarginPercent,
} from "@/lib/costing/costing-calculations";
import type {
  CostingLineInput,
  FoodCostAnalysis,
  FoodCostItemAnalysis,
  IngredientCostBreakdown,
  IngredientPricePoint,
  PriceTrend,
  RecipeIngredientInput,
} from "@/lib/ai/food-cost-types";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computePriceTrend(
  current: number,
  previous: number | null,
  thresholdPct = 2,
): { trend: PriceTrend; changePercent: number | null } {
  if (previous == null || previous <= 0) {
    return { trend: "stable", changePercent: null };
  }
  const changePercent = ((current - previous) / previous) * 100;
  if (Math.abs(changePercent) < thresholdPct) {
    return { trend: "stable", changePercent: round1(changePercent) };
  }
  return {
    trend: changePercent > 0 ? "up" : "down",
    changePercent: round1(changePercent),
  };
}

function lineIngredientCost(input: RecipeIngredientInput): number {
  const yq = Math.max(input.yieldQuantity, 0.0001);
  const waste = 1 + input.wastePercent / 100;
  return (input.quantity / yq) * input.costPerUnit * waste;
}

export function buildIngredientBreakdownForProduct(
  productId: string,
  recipeLines: RecipeIngredientInput[],
  priceByIngredient: Map<string, IngredientPricePoint>,
): IngredientCostBreakdown[] {
  const lines = recipeLines.filter((l) => l.productId === productId);
  if (lines.length === 0) return [];

  const costs = lines.map((line) => ({
    line,
    cost: lineIngredientCost(line),
  }));
  const total = costs.reduce((s, c) => s + c.cost, 0);

  return costs
    .map(({ line, cost }) => {
      const price = priceByIngredient.get(line.ingredientId);
      const current = price?.currentCostPerUnit ?? line.costPerUnit;
      const previous = price?.previousCostPerUnit ?? null;
      const { trend, changePercent } = computePriceTrend(current, previous);

      return {
        ingredientId: line.ingredientId,
        name: line.ingredientName,
        unit: line.unit,
        currentCostPerUnit: round2(current),
        previousCostPerUnit: previous != null ? round2(previous) : null,
        priceChangePercent: changePercent,
        priceTrend: trend,
        shareOfRecipeCostPercent: total > 0 ? round1((cost / total) * 100) : 0,
        usedInProductCount: price?.usedInProductCount ?? 1,
      };
    })
    .sort((a, b) => b.shareOfRecipeCostPercent - a.shareOfRecipeCostPercent);
}

export function buildTopIngredientMovers(
  pricePoints: IngredientPricePoint[],
  limit = 8,
): IngredientCostBreakdown[] {
  return pricePoints
    .map((p) => {
      const { trend, changePercent } = computePriceTrend(p.currentCostPerUnit, p.previousCostPerUnit);
      return {
        ingredientId: p.ingredientId,
        name: p.name,
        unit: p.unit,
        currentCostPerUnit: round2(p.currentCostPerUnit),
        previousCostPerUnit: p.previousCostPerUnit != null ? round2(p.previousCostPerUnit) : null,
        priceChangePercent: changePercent,
        priceTrend: trend,
        shareOfRecipeCostPercent: 0,
        usedInProductCount: p.usedInProductCount,
      };
    })
    .filter((i) => i.priceTrend !== "stable" && i.priceChangePercent != null)
    .sort((a, b) => Math.abs(b.priceChangePercent ?? 0) - Math.abs(a.priceChangePercent ?? 0))
    .slice(0, limit);
}

export function recommendForItem(input: {
  itemTitle: string;
  grossMarginPercent: number;
  foodCostPercent: number;
  targetMarginPercent: number;
  targetFoodCostPercent: number;
  suggestedPrice: number | null;
  topRisingIngredient?: string | null;
}): string {
  const marginGap = input.targetMarginPercent - input.grossMarginPercent;
  const foodCostGap = input.foodCostPercent - input.targetFoodCostPercent;

  if (marginGap > 15) {
    if (input.suggestedPrice != null) {
      return `Raise "${input.itemTitle}" toward $${input.suggestedPrice.toFixed(2)} — margin ${round1(input.grossMarginPercent)}% vs ${round1(input.targetMarginPercent)}% target.`;
    }
    return `"${input.itemTitle}" margin is ${round1(marginGap)} pts below target — review portion sizes or price.`;
  }

  if (foodCostGap > 5 && input.topRisingIngredient) {
    return `Food cost elevated on "${input.itemTitle}" — ${input.topRisingIngredient} price is rising; consider substitute or menu price bump.`;
  }

  if (input.foodCostPercent > input.targetFoodCostPercent + 3) {
    return `Food cost ${round1(input.foodCostPercent)}% exceeds ${round1(input.targetFoodCostPercent)}% target — audit recipe yields and waste %.`;
  }

  if (input.grossMarginPercent >= input.targetMarginPercent) {
    return `"${input.itemTitle}" is on target — monitor ingredient costs weekly.`;
  }

  return `Review "${input.itemTitle}" costing — margin ${round1(input.grossMarginPercent)}%, food cost ${round1(input.foodCostPercent)}%.`;
}

export function buildFoodCostItemAnalysis(input: {
  line: CostingLineInput;
  targetMarginPercent: number;
  targetFoodCostPercent: number;
  ingredientBreakdown: IngredientCostBreakdown[];
}): FoodCostItemAnalysis {
  const rising = input.ingredientBreakdown.find((i) => i.priceTrend === "up");
  const marginGap = input.targetMarginPercent - input.line.grossMarginPercent;

  return {
    productId: input.line.productId,
    itemTitle: input.line.itemTitle,
    salePrice: round2(input.line.salePrice),
    foodCostPercent: round1(input.line.foodCostPercent),
    grossMarginPercent: round1(input.line.grossMarginPercent),
    ingredientCost: round2(input.line.ingredientCost),
    laborCost: round2(input.line.laborCost),
    totalCost: round2(input.line.totalCost),
    targetFoodCostPercent: input.targetFoodCostPercent,
    targetMarginPercent: input.targetMarginPercent,
    marginGapPercent: round1(marginGap),
    warningLevel: input.line.warningLevel,
    suggestedPrice: input.line.suggestedPrice != null ? round2(input.line.suggestedPrice) : null,
    recommendation: recommendForItem({
      itemTitle: input.line.itemTitle,
      grossMarginPercent: input.line.grossMarginPercent,
      foodCostPercent: input.line.foodCostPercent,
      targetMarginPercent: input.targetMarginPercent,
      targetFoodCostPercent: input.targetFoodCostPercent,
      suggestedPrice: input.line.suggestedPrice,
      topRisingIngredient: rising?.name ?? null,
    }),
    ingredientBreakdown: input.ingredientBreakdown,
  };
}

export function buildWorkspaceRecommendations(input: {
  overallFoodCostPercent: number;
  overallGrossMarginPercent: number;
  targetFoodCostPercent: number;
  targetMarginPercent: number;
  itemsBelowTargetMargin: number;
  topIngredientMovers: IngredientCostBreakdown[];
  missingRecipes: number;
}): string[] {
  const recs: string[] = [
    "AI-assisted food cost analysis — validate against invoices before changing menu prices.",
  ];

  if (input.missingRecipes > 0) {
    recs.push(
      `${input.missingRecipes} active menu item(s) lack recipes — attach recipes to unlock accurate food cost %.`,
    );
  }

  if (input.overallFoodCostPercent > input.targetFoodCostPercent + 2) {
    recs.push(
      `Overall food cost ${round1(input.overallFoodCostPercent)}% exceeds ${round1(input.targetFoodCostPercent)}% target — prioritize high-volume low-margin items.`,
    );
  }

  if (input.itemsBelowTargetMargin > 0) {
    recs.push(
      `${input.itemsBelowTargetMargin} item(s) below ${round1(input.targetMarginPercent)}% margin target — run price sensitivity on top sellers first.`,
    );
  }

  const spikers = input.topIngredientMovers.filter((i) => i.priceTrend === "up").slice(0, 3);
  if (spikers.length > 0) {
    recs.push(
      `Ingredient price spikes: ${spikers.map((s) => `${s.name} (+${s.priceChangePercent}%)`).join(", ")} — renegotiate or adjust portions.`,
    );
  }

  if (input.overallGrossMarginPercent >= input.targetMarginPercent && recs.length === 1) {
    recs.push("Portfolio margin is healthy — keep supplier quotes updated for early spike detection.");
  }

  return recs.slice(0, 5);
}

export function computeOverallConfidence(input: {
  itemsAnalyzed: number;
  recipeCount: number;
  ingredientsWithHistory: number;
  totalIngredients: number;
}): number {
  let score = 0.5;
  if (input.itemsAnalyzed >= 20) score += 0.15;
  else if (input.itemsAnalyzed >= 5) score += 0.08;
  if (input.recipeCount >= input.itemsAnalyzed * 0.8) score += 0.12;
  if (input.totalIngredients > 0) {
    score += (input.ingredientsWithHistory / input.totalIngredients) * 0.2;
  }
  return Math.min(0.92, round2(score));
}

export function assembleFoodCostAnalysis(input: {
  workspaceId: string;
  targetMarginPercent: number;
  targetFoodCostPercent: number;
  costingLines: CostingLineInput[];
  recipeLines: RecipeIngredientInput[];
  pricePoints: IngredientPricePoint[];
  missingRecipes: number;
  recipeCount: number;
}): FoodCostAnalysis {
  const priceByIngredient = new Map(input.pricePoints.map((p) => [p.ingredientId, p]));

  const itemAnalyses = input.costingLines.map((line) =>
    buildFoodCostItemAnalysis({
      line,
      targetMarginPercent: input.targetMarginPercent,
      targetFoodCostPercent: input.targetFoodCostPercent,
      ingredientBreakdown: buildIngredientBreakdownForProduct(line.productId, input.recipeLines, priceByIngredient),
    }),
  );

  const avgFoodCost =
    itemAnalyses.length > 0
      ? itemAnalyses.reduce((s, i) => s + i.foodCostPercent, 0) / itemAnalyses.length
      : 0;
  const avgMargin =
    itemAnalyses.length > 0
      ? itemAnalyses.reduce((s, i) => s + i.grossMarginPercent, 0) / itemAnalyses.length
      : 0;

  const itemsBelowTargetMargin = itemAnalyses.filter(
    (i) => i.grossMarginPercent < input.targetMarginPercent,
  ).length;

  const topIngredientMovers = buildTopIngredientMovers(input.pricePoints);

  const ingredientsWithHistory = input.pricePoints.filter(
    (p) => p.previousCostPerUnit != null,
  ).length;

  return {
    workspaceId: input.workspaceId,
    analyzedAt: new Date().toISOString(),
    overallFoodCostPercent: round1(avgFoodCost),
    overallGrossMarginPercent: round1(avgMargin),
    targetFoodCostPercent: input.targetFoodCostPercent,
    targetMarginPercent: input.targetMarginPercent,
    itemsAnalyzed: itemAnalyses.length,
    itemsBelowTargetMargin,
    itemAnalyses: itemAnalyses.sort((a, b) => a.grossMarginPercent - b.grossMarginPercent),
    topIngredientMovers,
    recommendations: buildWorkspaceRecommendations({
      overallFoodCostPercent: avgFoodCost,
      overallGrossMarginPercent: avgMargin,
      targetFoodCostPercent: input.targetFoodCostPercent,
      targetMarginPercent: input.targetMarginPercent,
      itemsBelowTargetMargin,
      topIngredientMovers,
      missingRecipes: input.missingRecipes,
    }),
    aiAssisted: true,
    confidence: computeOverallConfidence({
      itemsAnalyzed: itemAnalyses.length,
      recipeCount: input.recipeCount,
      ingredientsWithHistory,
      totalIngredients: input.pricePoints.length,
    }),
  };
}

/** Quick margin recompute when sale price or ingredient cost changes (what-if). */
export function recomputeMargin(input: {
  salePrice: number;
  ingredientCost: number;
  totalCost: number;
}): { foodCostPercent: number; grossMarginPercent: number } {
  const grossProfit = input.salePrice - input.totalCost;
  return {
    foodCostPercent: round1(foodCostPercent(input.ingredientCost, input.salePrice)),
    grossMarginPercent: round1(grossMarginPercent(grossProfit, input.salePrice)),
  };
}
