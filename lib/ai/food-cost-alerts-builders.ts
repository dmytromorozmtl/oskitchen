import { addDays, addHours } from "date-fns";

import type {
  FoodCostAlert,
  FoodCostAlertSeverity,
  FoodCostAlertType,
} from "@/lib/ai/food-cost-alerts-types";
import {
  FOOD_COST_INGREDIENT_SPIKE_THRESHOLD,
  FOOD_COST_MARGIN_ALERT_THRESHOLD,
} from "@/lib/ai/food-cost-alerts-types";
import type { FoodCostItemAnalysis } from "@/lib/ai/food-cost-types";
import type { IngredientCostBreakdown } from "@/lib/ai/food-cost-types";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function slugId(type: FoodCostAlertType, key: string): string {
  return `${type}-${key.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48)}`;
}

function expiresAtFor(severity: FoodCostAlertSeverity, now = new Date()): Date {
  if (severity === "critical") return addHours(now, 48);
  if (severity === "warning") return addDays(now, 5);
  return addDays(now, 10);
}

function marginSeverity(marginPercent: number): FoodCostAlertSeverity {
  if (marginPercent < 15) return "critical";
  if (marginPercent < 22) return "warning";
  return "info";
}

function spikeSeverity(changePercent: number): FoodCostAlertSeverity {
  if (changePercent >= 25) return "critical";
  if (changePercent >= 15) return "warning";
  return "info";
}

export type ProductVolumeEstimate = {
  productId: string;
  weeklyUnits: number;
};

export type IngredientUsageEstimate = {
  ingredientId: string;
  weeklyUsage: number;
  unitCost: number;
};

export function alertLowMarginItems(input: {
  items: FoodCostItemAnalysis[];
  volumeByProduct: Map<string, number>;
  marginThreshold?: number;
  now?: Date;
}): FoodCostAlert[] {
  const threshold = input.marginThreshold ?? FOOD_COST_MARGIN_ALERT_THRESHOLD;
  const now = input.now ?? new Date();
  const alerts: FoodCostAlert[] = [];

  for (const item of input.items) {
    if (item.grossMarginPercent >= threshold) continue;

    const weeklyUnits = input.volumeByProduct.get(item.productId) ?? 10;
    const marginGapPct = threshold - item.grossMarginPercent;
    const impact = round2(Math.max(0, (marginGapPct / 100) * item.salePrice * weeklyUnits));
    const severity = marginSeverity(item.grossMarginPercent);
    const confidence =
      item.salePrice > 0 && item.ingredientBreakdown.length > 0 ? 0.84 : item.salePrice > 0 ? 0.68 : 0.52;

    alerts.push({
      id: slugId("low_margin", item.productId),
      type: "low_margin",
      severity,
      title: `Low margin: ${item.itemTitle} (${item.grossMarginPercent}%)`,
      description: `AI-assisted: "${item.itemTitle}" gross margin ${item.grossMarginPercent}% is below ${threshold}% threshold. Food cost ${item.foodCostPercent}%.`,
      impact,
      confidence,
      suggestedAction:
        item.suggestedPrice != null
          ? `Increase price toward $${item.suggestedPrice.toFixed(2)} or reduce portion cost — est. weekly impact $${impact.toFixed(0)}.`
          : `Review recipe yields and supplier quotes for "${item.itemTitle}" — est. weekly impact $${impact.toFixed(0)}.`,
      expiresAt: expiresAtFor(severity, now),
      productId: item.productId,
    });
  }

  return alerts.sort((a, b) => a.severity.localeCompare(b.severity) || b.impact - a.impact);
}

export function alertIngredientPriceSpikes(input: {
  movers: IngredientCostBreakdown[];
  usageByIngredient: Map<string, IngredientUsageEstimate>;
  spikeThreshold?: number;
  now?: Date;
}): FoodCostAlert[] {
  const threshold = input.spikeThreshold ?? FOOD_COST_INGREDIENT_SPIKE_THRESHOLD;
  const now = input.now ?? new Date();
  const alerts: FoodCostAlert[] = [];

  for (const ing of input.movers) {
    if (ing.priceTrend !== "up") continue;
    const change = ing.priceChangePercent ?? 0;
    if (change < threshold) continue;
    if (ing.previousCostPerUnit == null) continue;

    const usage = input.usageByIngredient.get(ing.ingredientId);
    const weeklyUsage = usage?.weeklyUsage ?? ing.usedInProductCount * 5;
    const unitDelta = ing.currentCostPerUnit - ing.previousCostPerUnit;
    const impact = round2(Math.max(0, unitDelta * weeklyUsage));
    const severity = spikeSeverity(change);
    const confidence = usage ? 0.86 : ing.usedInProductCount >= 2 ? 0.74 : 0.6;

    alerts.push({
      id: slugId("ingredient_price_spike", ing.ingredientId),
      type: "ingredient_price_spike",
      severity,
      title: `Ingredient price spike: ${ing.name} (+${change}%)`,
      description: `AI-assisted: ${ing.name} rose from $${ing.previousCostPerUnit.toFixed(2)} to $${ing.currentCostPerUnit.toFixed(2)} per ${ing.unit}. Used in ${ing.usedInProductCount} menu item(s).`,
      impact,
      confidence,
      suggestedAction: `Renegotiate ${ing.name} with supplier, substitute where possible, or adjust menu prices — est. weekly COGS impact $${impact.toFixed(0)}.`,
      expiresAt: expiresAtFor(severity, now),
      ingredientId: ing.ingredientId,
    });
  }

  return alerts.sort((a, b) => b.impact - a.impact);
}

export function mergeFoodCostAlerts(alerts: FoodCostAlert[]): FoodCostAlert[] {
  const byId = new Map<string, FoodCostAlert>();
  for (const alert of alerts) {
    const existing = byId.get(alert.id);
    if (!existing || alert.impact > existing.impact) {
      byId.set(alert.id, alert);
    }
  }

  const severityRank: Record<FoodCostAlertSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return [...byId.values()].sort(
    (a, b) =>
      severityRank[a.severity] - severityRank[b.severity] ||
      b.impact - a.impact,
  );
}

export function applyVolumeFromTopProductsByTitle(
  items: FoodCostItemAnalysis[],
  topProducts: { title: string; quantity: number }[],
  windowDays: number,
  base: Map<string, number>,
): Map<string, number> {
  const weeks = Math.max(windowDays / 7, 1);
  const byTitle = new Map(topProducts.map((p) => [p.title.toLowerCase(), p.quantity / weeks]));
  const next = new Map(base);

  for (const item of items) {
    const weekly = byTitle.get(item.itemTitle.toLowerCase());
    if (weekly != null && weekly > 0) {
      next.set(item.productId, Math.max(1, Math.round(weekly)));
    }
  }

  return next;
}

export function buildIngredientUsageMap(
  demandRows: { ingredientId: string; required: number }[],
  windowDays: number,
): Map<string, IngredientUsageEstimate> {
  const weeks = Math.max(windowDays / 7, 1);
  const totals = new Map<string, number>();
  for (const row of demandRows) {
    totals.set(row.ingredientId, (totals.get(row.ingredientId) ?? 0) + row.required);
  }

  const map = new Map<string, IngredientUsageEstimate>();
  for (const [ingredientId, required] of totals) {
    map.set(ingredientId, {
      ingredientId,
      weeklyUsage: required / weeks,
      unitCost: 0,
    });
  }
  return map;
}
