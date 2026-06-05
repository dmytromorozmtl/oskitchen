import { addDays } from "date-fns";

import type {
  AiPurchasingDailyBrief,
  AiPurchasingResult,
  IngredientPurchasingInput,
  PriceOptimization,
  PurchaseAlternativeSupplier,
  PurchaseRecommendation,
  PurchaseSupplierChoice,
  PurchasingUrgency,
  ShortagePrediction,
  SupplierOfferInput,
} from "@/lib/ai/ai-purchasing-types";
import { suggestReorderQuantity } from "@/lib/purchasing/reorder-rules";

const FORECAST_HORIZON_DAYS = 14;
const DEFAULT_ORDERING_COST = 25;
const DEFAULT_HOLDING_RATE = 0.25;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Economic order quantity — classic √(2DS/H). */
export function computeEoq(
  dailyDemand: number,
  unitCost: number,
  orderingCost = DEFAULT_ORDERING_COST,
  holdingRate = DEFAULT_HOLDING_RATE,
): number {
  if (dailyDemand <= 0 || unitCost <= 0) return 0;
  const annualDemand = dailyDemand * 365;
  const holdingCost = unitCost * holdingRate;
  const raw = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
  return round1(Math.max(raw, dailyDemand));
}

export function computeDailyUsage(demandRequired: number, windowDays: number): number {
  if (demandRequired <= 0 || windowDays <= 0) return 0;
  return round2(demandRequired / windowDays);
}

export function computePredictedDemand14d(dailyUsage: number, forecast14d: number | null): number {
  if (forecast14d != null && forecast14d > 0) {
    return round1(forecast14d);
  }
  return round1(dailyUsage * FORECAST_HORIZON_DAYS);
}

export function computeDaysRemaining(currentStock: number, dailyUsage: number): number | null {
  if (dailyUsage <= 0) return null;
  return round1(currentStock / dailyUsage);
}

export function urgencyFromDaysRemaining(
  daysRemaining: number | null,
  leadTimeDays: number,
): PurchasingUrgency {
  if (daysRemaining == null) return "low";
  if (daysRemaining <= 1 || daysRemaining <= leadTimeDays * 0.5) return "critical";
  if (daysRemaining <= leadTimeDays) return "high";
  if (daysRemaining <= leadTimeDays * 2) return "normal";
  return "low";
}

function sortOffers(offers: SupplierOfferInput[]): SupplierOfferInput[] {
  return [...offers].sort((a, b) => a.unitCost - b.unitCost || a.leadTimeDays - b.leadTimeDays);
}

function buildSupplierChoice(
  offer: SupplierOfferInput,
  orderQuantity: number,
  dailyUsage: number,
): PurchaseSupplierChoice {
  const eoq = computeEoq(dailyUsage, offer.unitCost);
  const minQ = offer.minimumQuantity ?? 0;
  const pack = offer.packSize && offer.packSize > 0 ? offer.packSize : null;
  let qty = Math.max(orderQuantity, eoq, minQ);
  if (pack) {
    qty = Math.ceil(qty / pack) * pack;
  }
  qty = round1(qty);

  return {
    supplierId: offer.supplierId,
    supplierName: offer.supplierName,
    supplierItemId: offer.supplierItemId,
    unitCost: round2(offer.unitCost),
    eoq: round1(eoq),
    orderQuantity: qty,
    orderTotal: round2(qty * offer.unitCost),
    leadTimeDays: offer.leadTimeDays,
  };
}

function buildAlternative(
  best: PurchaseSupplierChoice,
  altOffer: SupplierOfferInput,
  orderQuantity: number,
  dailyUsage: number,
): PurchaseAlternativeSupplier {
  const alt = buildSupplierChoice(altOffer, orderQuantity, dailyUsage);
  const savingsPerOrder = round2(Math.max(0, best.orderTotal - alt.orderTotal));
  const savingsPercent =
    best.orderTotal > 0 ? round1((savingsPerOrder / best.orderTotal) * 100) : 0;

  return {
    ...alt,
    savingsPerOrder,
    savingsPercent,
  };
}

function fallbackOffer(input: IngredientPurchasingInput): SupplierOfferInput {
  return {
    supplierId: `default-${input.ingredientId}`,
    supplierName: input.defaultSupplierName?.trim() || "Unassigned supplier",
    supplierItemId: null,
    unitCost: input.defaultUnitCost,
    purchaseUnit: input.unit,
    packSize: null,
    minimumQuantity: null,
    leadTimeDays: 3,
  };
}

function recommendationConfidence(input: {
  hasSupplierCatalog: boolean;
  dailyUsage: number;
  demandRequired: number;
  offerCount: number;
}): number {
  let score = 0.45;
  if (input.dailyUsage > 0) score += 0.2;
  if (input.demandRequired > 0) score += 0.15;
  if (input.hasSupplierCatalog) score += 0.12;
  if (input.offerCount >= 2) score += 0.08;
  return round2(Math.min(0.95, score));
}

export function predictShortage(input: {
  currentStock: number;
  dailyUsage: number;
  predictedDemand14d: number;
  leadTimeDays: number;
  analyzedAt?: Date;
}): ShortagePrediction {
  const daysUntilShortage = computeDaysRemaining(input.currentStock, input.dailyUsage);
  const predictedShortageQty = round1(Math.max(0, input.predictedDemand14d - input.currentStock));
  const shortageDateIso =
    daysUntilShortage != null
      ? addDays(input.analyzedAt ?? new Date(), Math.ceil(daysUntilShortage)).toISOString()
      : null;
  const coverageGapDays =
    daysUntilShortage != null ? round1(Math.max(0, input.leadTimeDays - daysUntilShortage)) : 0;

  return {
    predictedShortageQty,
    shortageDateIso,
    daysUntilShortage,
    coverageGapDays,
  };
}

export function optimizePrice(input: {
  best: PurchaseSupplierChoice;
  alt: PurchaseAlternativeSupplier | null;
  urgency: PurchasingUrgency;
  defaultUnitCost: number;
}): PriceOptimization {
  const currentBestUnitCost = input.best.unitCost;
  const defaultOrderTotal = round2(input.best.orderQuantity * input.defaultUnitCost);
  const savingsVsDefault = round2(Math.max(0, defaultOrderTotal - input.best.orderTotal));

  if (savingsVsDefault >= 1) {
    return {
      optimizedUnitCost: currentBestUnitCost,
      currentBestUnitCost: input.defaultUnitCost,
      savingsPerUnit: round2(Math.max(0, input.defaultUnitCost - currentBestUnitCost)),
      savingsPerOrder: savingsVsDefault,
      recommendation: "switch_supplier",
      rationale: `Switch to ${input.best.supplierName} at $${currentBestUnitCost.toFixed(2)}/unit — saves $${savingsVsDefault.toFixed(2)} vs default supplier cost.`,
    };
  }

  if (input.alt && input.alt.savingsPerOrder >= 1) {
    const savingsPerUnit = round2(Math.max(0, currentBestUnitCost - input.alt.unitCost));
    return {
      optimizedUnitCost: input.alt.unitCost,
      currentBestUnitCost,
      savingsPerUnit,
      savingsPerOrder: input.alt.savingsPerOrder,
      recommendation: "switch_supplier",
      rationale: `Switch to ${input.alt.supplierName} — saves $${input.alt.savingsPerOrder.toFixed(2)} on this order.`,
    };
  }

  if (input.urgency === "critical" || input.urgency === "high") {
    return {
      optimizedUnitCost: currentBestUnitCost,
      currentBestUnitCost,
      savingsPerUnit: 0,
      savingsPerOrder: 0,
      recommendation: "order_now",
      rationale: "Stock coverage is below lead time — prioritize replenishment over price shopping.",
    };
  }

  if (input.best.eoq > input.best.orderQuantity * 1.15) {
    return {
      optimizedUnitCost: currentBestUnitCost,
      currentBestUnitCost,
      savingsPerUnit: 0,
      savingsPerOrder: 0,
      recommendation: "bulk_up",
      rationale: `Consider bulk to EOQ ${input.best.eoq} to reduce reorder frequency.`,
    };
  }

  return {
    optimizedUnitCost: currentBestUnitCost,
    currentBestUnitCost,
    savingsPerUnit: 0,
    savingsPerOrder: 0,
    recommendation: "hold",
    rationale: "Coverage is healthy — no immediate price or quantity change.",
  };
}

export function buildAiPurchasingDailyBrief(
  recommendations: PurchaseRecommendation[],
  analyzedAt: Date,
): AiPurchasingDailyBrief {
  const urgent = recommendations.filter((row) => row.urgency === "critical" || row.urgency === "high");
  const totalSpend = round2(recommendations.reduce((sum, row) => sum + row.bestSupplier.orderTotal, 0));
  const totalSavings = round2(
    recommendations.reduce((sum, row) => sum + (row.alternativeSupplier?.savingsPerOrder ?? 0), 0),
  );
  const priceSwitchCount = recommendations.filter(
    (row) => row.priceOptimization.recommendation === "switch_supplier",
  ).length;
  const orderTodayCount = recommendations.filter(
    (row) => row.priceOptimization.recommendation === "order_now",
  ).length;

  const topShortages = [...recommendations]
    .filter((row) => row.shortagePrediction.predictedShortageQty > 0)
    .sort(
      (left, right) =>
        (left.shortagePrediction.daysUntilShortage ?? 999) -
        (right.shortagePrediction.daysUntilShortage ?? 999),
    )
    .slice(0, 5)
    .map((row) => ({
      ingredientName: row.ingredientName,
      daysUntilShortage: row.shortagePrediction.daysUntilShortage,
      predictedShortageQty: row.shortagePrediction.predictedShortageQty,
    }));

  const topSavings = [...recommendations]
    .filter((row) => (row.alternativeSupplier?.savingsPerOrder ?? 0) > 0)
    .sort(
      (left, right) =>
        (right.alternativeSupplier?.savingsPerOrder ?? 0) -
        (left.alternativeSupplier?.savingsPerOrder ?? 0),
    )
    .slice(0, 5)
    .map((row) => ({
      ingredientName: row.ingredientName,
      supplierName: row.alternativeSupplier!.supplierName,
      savingsPerOrder: row.alternativeSupplier!.savingsPerOrder,
    }));

  const headline =
    urgent.length > 0
      ? `${urgent.length} items need orders today — $${totalSpend.toFixed(0)} estimated spend`
      : recommendations.length > 0
        ? `${recommendations.length} purchase opportunities — $${totalSavings.toFixed(0)} potential savings`
        : "Purchasing clear — no shortage signals in the next 14 days";

  const executiveSummary =
    urgent.length > 0
      ? `Shortage prediction flags ${urgent.length} urgent line${urgent.length === 1 ? "" : "s"}. ${priceSwitchCount} alternative supplier switch${priceSwitchCount === 1 ? "" : "es"} can reduce spend.`
      : `14-day demand scan found ${recommendations.length} reorder candidate${recommendations.length === 1 ? "" : "s"} with $${totalSavings.toFixed(0)} optimizable via alternate suppliers.`;

  const bullets = [
    orderTodayCount > 0 ? `${orderTodayCount} item${orderTodayCount === 1 ? "" : "s"} below lead-time coverage` : null,
    priceSwitchCount > 0
      ? `${priceSwitchCount} supplier switch${priceSwitchCount === 1 ? "" : "es"} recommended for price optimization`
      : null,
    topShortages.length > 0
      ? `Top shortage: ${topShortages[0]!.ingredientName}${topShortages[0]!.daysUntilShortage != null ? ` in ~${topShortages[0]!.daysUntilShortage}d` : ""}`
      : null,
    topSavings.length > 0
      ? `Best savings: ${topSavings[0]!.ingredientName} via ${topSavings[0]!.supplierName} ($${topSavings[0]!.savingsPerOrder.toFixed(2)})`
      : null,
  ].filter((line): line is string => line != null);

  return {
    generatedAtIso: analyzedAt.toISOString(),
    headline,
    executiveSummary,
    topShortages,
    topSavings,
    priceSwitchCount,
    orderTodayCount,
    bullets,
  };
}

function suggestedActionFor(input: {
  unit: string;
  urgency: PurchasingUrgency;
  daysRemaining: number | null;
  best: PurchaseSupplierChoice;
  alt: PurchaseAlternativeSupplier | null;
}): string {
  const qty = input.best.orderQuantity;
  const supplier = input.best.supplierName;
  if (input.urgency === "critical") {
    return `Order ${qty} ${input.unit} from ${supplier} today — stock covers ~${input.daysRemaining ?? 0} days.`;
  }
  if (input.alt && input.alt.savingsPerOrder > 0) {
    return `Order ${qty} from ${supplier} (EOQ ${input.best.eoq}). ${input.alt.supplierName} saves $${input.alt.savingsPerOrder.toFixed(2)} per order at same quantity.`;
  }
  return `Order ${qty} from ${supplier} — EOQ ${input.best.eoq}, est. total $${input.best.orderTotal.toFixed(2)}.`;
}

export function buildPurchaseRecommendation(
  input: IngredientPurchasingInput,
  windowDays: number,
): PurchaseRecommendation | null {
  const dailyUsage = computeDailyUsage(input.demandRequired, windowDays);
  const predictedDemand14d = computePredictedDemand14d(dailyUsage, input.forecast14d);
  const shortage = Math.max(0, predictedDemand14d - input.currentStock);
  const parSuggested = suggestReorderQuantity({
    shortage,
    parLevel: input.parLevel,
    currentStock: input.currentStock,
  });

  if (dailyUsage <= 0 && shortage <= 0 && input.currentStock > input.parLevel) {
    return null;
  }

  const offers = sortOffers(input.supplierOffers.length > 0 ? input.supplierOffers : [fallbackOffer(input)]);
  const bestOffer = offers[0]!;
  const altOffer = offers[1] ?? null;

  const best = buildSupplierChoice(bestOffer, parSuggested, dailyUsage);
  const alt = altOffer ? buildAlternative(best, altOffer, parSuggested, dailyUsage) : null;
  const daysRemaining = computeDaysRemaining(input.currentStock, dailyUsage);
  const urgency = urgencyFromDaysRemaining(daysRemaining, best.leadTimeDays);
  const confidence = recommendationConfidence({
    hasSupplierCatalog: input.supplierOffers.length > 0,
    dailyUsage,
    demandRequired: input.demandRequired,
    offerCount: offers.length,
  });
  const shortagePrediction = predictShortage({
    currentStock: input.currentStock,
    dailyUsage,
    predictedDemand14d,
    leadTimeDays: best.leadTimeDays,
  });
  const priceOptimization = optimizePrice({
    best,
    alt,
    urgency,
    defaultUnitCost: input.defaultUnitCost,
  });

  return {
    ingredientId: input.ingredientId,
    ingredientName: input.name,
    unit: input.unit,
    category: input.category,
    currentStock: round1(input.currentStock),
    reorderPoint: input.reorderPoint != null ? round1(input.reorderPoint) : null,
    dailyUsage,
    predictedDemand14d,
    daysRemaining,
    urgency,
    bestSupplier: best,
    alternativeSupplier: alt,
    shortagePrediction,
    priceOptimization,
    confidence,
    suggestedAction: suggestedActionFor({
      unit: input.unit,
      urgency,
      daysRemaining,
      best,
      alt,
    }),
  };
}

export function assembleAiPurchasingResult(input: {
  workspaceId: string;
  recommendations: PurchaseRecommendation[];
  analyzedAt?: Date;
}): AiPurchasingResult {
  const recs = [...input.recommendations].sort((a, b) => {
    const urgencyRank: Record<PurchasingUrgency, number> = { critical: 0, high: 1, normal: 2, low: 3 };
    const du = urgencyRank[a.urgency] - urgencyRank[b.urgency];
    if (du !== 0) return du;
    return (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999);
  });

  const totalEstimatedSpend = round2(recs.reduce((s, r) => s + r.bestSupplier.orderTotal, 0));
  const totalPotentialSavings = round2(
    recs.reduce((s, r) => s + (r.alternativeSupplier?.savingsPerOrder ?? 0), 0),
  );
  const averageConfidence =
    recs.length > 0 ? round2(recs.reduce((s, r) => s + r.confidence, 0) / recs.length) : 0.5;

  const dataConfidence = recs.length > 0 ? Math.min(0.92, averageConfidence + 0.05) : 0.4;
  const analyzedAt = input.analyzedAt ?? new Date();
  const shortageCount = recs.filter((row) => row.shortagePrediction.predictedShortageQty > 0).length;
  const priceSwitchCount = recs.filter(
    (row) => row.priceOptimization.recommendation === "switch_supplier",
  ).length;

  return {
    workspaceId: input.workspaceId,
    analyzedAt: analyzedAt.toISOString(),
    forecastHorizonDays: FORECAST_HORIZON_DAYS,
    recommendations: recs,
    dailyBrief: buildAiPurchasingDailyBrief(recs, analyzedAt),
    summary: {
      itemCount: recs.length,
      criticalCount: recs.filter((r) => r.urgency === "critical").length,
      highCount: recs.filter((r) => r.urgency === "high").length,
      totalEstimatedSpend,
      totalPotentialSavings,
      averageConfidence,
      shortageCount,
      priceSwitchCount,
    },
    aiAssisted: true,
    confidence: round2(dataConfidence),
  };
}

/** Expiry for stale recommendations — used by automation layer later. */
export function recommendationExpiresAt(analyzedAt: Date): Date {
  return addDays(analyzedAt, 2);
}
