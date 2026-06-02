import { addDays } from "date-fns";

import type {
  AiPurchasingResult,
  IngredientPurchasingInput,
  PurchaseAlternativeSupplier,
  PurchaseRecommendation,
  PurchaseSupplierChoice,
  PurchasingUrgency,
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

  return {
    workspaceId: input.workspaceId,
    analyzedAt: (input.analyzedAt ?? new Date()).toISOString(),
    forecastHorizonDays: FORECAST_HORIZON_DAYS,
    recommendations: recs,
    summary: {
      itemCount: recs.length,
      criticalCount: recs.filter((r) => r.urgency === "critical").length,
      highCount: recs.filter((r) => r.urgency === "high").length,
      totalEstimatedSpend,
      totalPotentialSavings,
      averageConfidence,
    },
    aiAssisted: true,
    confidence: round2(dataConfidence),
  };
}

/** Expiry for stale recommendations — used by automation layer later. */
export function recommendationExpiresAt(analyzedAt: Date): Date {
  return addDays(analyzedAt, 2);
}
