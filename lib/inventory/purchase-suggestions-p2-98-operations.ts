/**
 * Pure helpers for purchase suggestions AI (Blueprint P2-98).
 */

import type { PurchaseRecommendation } from "@/lib/ai/ai-purchasing-types";

export type PurchaseSuggestionSignalType = "forecast" | "low_stock" | "menu_demand" | "vendor_price";

export type PurchaseSuggestionSignal = {
  type: PurchaseSuggestionSignalType;
  label: string;
  detail: string;
  score: number;
};

export type PurchaseSuggestionItem = {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  urgency: PurchaseRecommendation["urgency"];
  confidence: number;
  orderQuantity: number;
  estimatedTotal: number;
  supplierName: string;
  signals: PurchaseSuggestionSignal[];
  suggestedAction: string;
};

export type PurchaseSuggestionsReport = {
  itemCount: number;
  criticalCount: number;
  forecastCount: number;
  lowStockCount: number;
  menuDemandCount: number;
  vendorPriceCount: number;
  estimatedSpend: number;
  items: PurchaseSuggestionItem[];
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function buildForecastSignal(rec: PurchaseRecommendation): PurchaseSuggestionSignal {
  const daily = rec.dailyUsage;
  const forecast = rec.predictedDemand14d;
  const trendPct =
    daily > 0 ? round2(((forecast / 14 - daily) / daily) * 100) : 0;

  return {
    type: "forecast",
    label: `14d forecast: ${forecast} ${rec.unit}`,
    detail:
      trendPct >= 5
        ? `Demand trending up ${trendPct}% vs daily usage`
        : trendPct <= -5
          ? `Demand softening ${Math.abs(trendPct)}% vs daily usage`
          : "Stable 14-day demand forecast",
    score: Math.min(1, rec.confidence),
  };
}

export function buildLowStockSignal(rec: PurchaseRecommendation): PurchaseSuggestionSignal | null {
  const days = rec.daysRemaining;
  const reorder = rec.reorderPoint;
  const isLow =
    rec.urgency === "critical" ||
    rec.urgency === "high" ||
    (days != null && days <= 3) ||
    (reorder != null && rec.currentStock <= reorder);

  if (!isLow) return null;

  return {
    type: "low_stock",
    label: days != null ? `${days} days of stock left` : "Below reorder point",
    detail:
      rec.shortagePrediction.predictedShortageQty > 0
        ? `Predicted shortage: ${rec.shortagePrediction.predictedShortageQty} ${rec.unit}`
        : `Current stock ${rec.currentStock} ${rec.unit}${reorder != null ? ` · reorder at ${reorder}` : ""}`,
    score: rec.urgency === "critical" ? 1 : rec.urgency === "high" ? 0.85 : 0.7,
  };
}

export function buildMenuDemandSignal(rec: PurchaseRecommendation): PurchaseSuggestionSignal | null {
  if (rec.dailyUsage <= 0) return null;

  return {
    type: "menu_demand",
    label: `Menu pull: ${rec.dailyUsage} ${rec.unit}/day`,
    detail: `Ingredient demand from recipes and open orders — category ${rec.category ?? "general"}`,
    score: Math.min(0.95, 0.5 + rec.dailyUsage * 0.05),
  };
}

export function buildVendorPriceSignal(rec: PurchaseRecommendation): PurchaseSuggestionSignal | null {
  const opt = rec.priceOptimization;
  if (opt.recommendation === "hold" && !rec.alternativeSupplier) return null;

  const savings = rec.alternativeSupplier?.savingsPerOrder ?? opt.savingsPerOrder;
  const detail =
    opt.recommendation === "switch_supplier"
      ? opt.rationale
      : opt.recommendation === "bulk_up"
        ? opt.rationale
        : rec.alternativeSupplier
          ? `Alternative ${rec.alternativeSupplier.supplierName} saves $${savings.toFixed(2)}/order`
          : opt.rationale;

  return {
    type: "vendor_price",
    label:
      opt.recommendation === "switch_supplier"
        ? `Switch supplier — save $${savings.toFixed(2)}`
        : opt.recommendation === "bulk_up"
          ? "Bulk up to EOQ"
          : opt.recommendation === "order_now"
            ? "Order now — coverage critical"
            : "Vendor price review",
    detail,
    score: savings > 0 ? Math.min(1, 0.6 + savings / 50) : 0.65,
  };
}

export function buildPurchaseSuggestionItem(rec: PurchaseRecommendation): PurchaseSuggestionItem {
  const signals: PurchaseSuggestionSignal[] = [buildForecastSignal(rec)];

  const lowStock = buildLowStockSignal(rec);
  if (lowStock) signals.push(lowStock);

  const menuDemand = buildMenuDemandSignal(rec);
  if (menuDemand) signals.push(menuDemand);

  const vendorPrice = buildVendorPriceSignal(rec);
  if (vendorPrice) signals.push(vendorPrice);

  return {
    ingredientId: rec.ingredientId,
    ingredientName: rec.ingredientName,
    unit: rec.unit,
    urgency: rec.urgency,
    confidence: rec.confidence,
    orderQuantity: rec.bestSupplier.orderQuantity,
    estimatedTotal: rec.bestSupplier.orderTotal,
    supplierName: rec.bestSupplier.supplierName,
    signals,
    suggestedAction: rec.suggestedAction,
  };
}

export function buildPurchaseSuggestionsReport(
  recommendations: readonly PurchaseRecommendation[],
): PurchaseSuggestionsReport {
  const items = recommendations
    .map((rec) => buildPurchaseSuggestionItem(rec))
    .sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency] || b.estimatedTotal - a.estimatedTotal;
    });

  const hasSignal = (type: PurchaseSuggestionSignalType) =>
    items.filter((item) => item.signals.some((s) => s.type === type)).length;

  return {
    itemCount: items.length,
    criticalCount: items.filter((i) => i.urgency === "critical").length,
    forecastCount: hasSignal("forecast"),
    lowStockCount: hasSignal("low_stock"),
    menuDemandCount: hasSignal("menu_demand"),
    vendorPriceCount: hasSignal("vendor_price"),
    estimatedSpend: round2(items.reduce((sum, i) => sum + i.estimatedTotal, 0)),
    items,
  };
}

/** Demo fixture — deterministic purchase suggestions without DB. */
export const PURCHASE_SUGGESTIONS_DEMO_FIXTURE: readonly PurchaseRecommendation[] = [
  {
    ingredientId: "demo-chicken",
    ingredientName: "Chicken breast",
    unit: "lb",
    category: "Protein",
    currentStock: 8,
    reorderPoint: 15,
    dailyUsage: 4.2,
    predictedDemand14d: 68,
    daysRemaining: 1.9,
    urgency: "critical",
    bestSupplier: {
      supplierId: "sup-usfoods",
      supplierName: "US Foods",
      supplierItemId: null,
      unitCost: 3.45,
      eoq: 40,
      orderQuantity: 40,
      orderTotal: 138,
      leadTimeDays: 2,
    },
    alternativeSupplier: {
      supplierId: "sup-sysco",
      supplierName: "Sysco",
      supplierItemId: null,
      unitCost: 3.28,
      eoq: 40,
      orderQuantity: 40,
      orderTotal: 131.2,
      leadTimeDays: 3,
      savingsPerOrder: 6.8,
      savingsPercent: 4.9,
    },
    shortagePrediction: {
      predictedShortageQty: 60,
      shortageDateIso: null,
      daysUntilShortage: 1.9,
      coverageGapDays: 0.1,
    },
    priceOptimization: {
      optimizedUnitCost: 3.28,
      currentBestUnitCost: 3.45,
      savingsPerUnit: 0.17,
      savingsPerOrder: 6.8,
      recommendation: "switch_supplier",
      rationale: "Switch to Sysco at $3.28/lb — saves $6.80 vs US Foods.",
    },
    confidence: 0.88,
    suggestedAction: "Order 40 lb today — critical coverage gap.",
  },
  {
    ingredientId: "demo-tomatoes",
    ingredientName: "Roma tomatoes",
    unit: "case",
    category: "Produce",
    currentStock: 6,
    reorderPoint: 4,
    dailyUsage: 0.8,
    predictedDemand14d: 12,
    daysRemaining: 7.5,
    urgency: "normal",
    bestSupplier: {
      supplierId: "sup-produce",
      supplierName: "Fresh Valley Produce",
      supplierItemId: null,
      unitCost: 22,
      eoq: 8,
      orderQuantity: 8,
      orderTotal: 176,
      leadTimeDays: 1,
    },
    alternativeSupplier: null,
    shortagePrediction: {
      predictedShortageQty: 6,
      shortageDateIso: null,
      daysUntilShortage: 7.5,
      coverageGapDays: 0,
    },
    priceOptimization: {
      optimizedUnitCost: 22,
      currentBestUnitCost: 22,
      savingsPerUnit: 0,
      savingsPerOrder: 0,
      recommendation: "hold",
      rationale: "Coverage is healthy — no immediate price or quantity change.",
    },
    confidence: 0.82,
    suggestedAction: "Monitor — reorder in ~5 days.",
  },
] as const;
