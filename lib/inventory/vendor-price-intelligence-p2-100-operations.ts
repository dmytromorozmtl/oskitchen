/**
 * Pure helpers for vendor price intelligence (Blueprint P2-100).
 */

export type VendorPriceHistoryPoint = {
  ingredientId: string;
  ingredientName: string;
  supplierName: string;
  date: string;
  unitPrice: number;
  changePercent: number | null;
};

export type VendorSubstitutionSuggestion = {
  ingredientId: string;
  ingredientName: string;
  primarySupplier: string;
  substituteIngredientId: string;
  substituteName: string;
  substituteSupplier: string;
  savingsPerUnit: number;
  savingsPercent: number;
  reason: string;
};

export type CheaperVendorRecommendation = {
  ingredientId: string;
  ingredientName: string;
  currentSupplier: string;
  currentUnitPrice: number;
  cheaperSupplier: string;
  cheaperUnitPrice: number;
  savingsPerOrder: number;
  savingsPercent: number;
  orderQuantity: number;
  recommendation: string;
};

export type VendorPriceIntelligenceReport = {
  priceHistoryCount: number;
  substitutionCount: number;
  cheaperVendorCount: number;
  totalPotentialSavings: number;
  priceHistory: VendorPriceHistoryPoint[];
  substitutions: VendorSubstitutionSuggestion[];
  cheaperVendors: CheaperVendorRecommendation[];
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function computePriceChangePercent(
  currentPrice: number,
  previousPrice: number | null,
): number | null {
  if (previousPrice == null || previousPrice <= 0) return null;
  return round1(((currentPrice - previousPrice) / previousPrice) * 100);
}

export function buildPriceHistoryPoints(
  rows: Array<{
    ingredientId: string;
    ingredientName: string;
    supplierName: string;
    date: string;
    unitPrice: number;
  }>,
): VendorPriceHistoryPoint[] {
  const sorted = [...rows].sort(
    (a, b) =>
      a.ingredientId.localeCompare(b.ingredientId) ||
      a.supplierName.localeCompare(b.supplierName) ||
      a.date.localeCompare(b.date),
  );

  const lastPriceByKey = new Map<string, number>();

  return sorted.map((row) => {
    const key = `${row.ingredientId}:${row.supplierName}`;
    const previous = lastPriceByKey.get(key) ?? null;
    const changePercent = computePriceChangePercent(row.unitPrice, previous);
    lastPriceByKey.set(key, row.unitPrice);

    return {
      ingredientId: row.ingredientId,
      ingredientName: row.ingredientName,
      supplierName: row.supplierName,
      date: row.date,
      unitPrice: round2(row.unitPrice),
      changePercent,
    };
  });
}

export function buildSubstitutionSuggestions(
  comparisons: ReadonlyArray<{
    readonly ingredientId: string;
    readonly ingredientName: string;
    readonly suppliers: ReadonlyArray<{ readonly supplierName: string; readonly latestPrice: number }>;
  }>,
  substitutes: ReadonlyArray<{
    readonly ingredientId: string;
    readonly ingredientName: string;
    readonly substituteIngredientId: string;
    readonly substituteName: string;
    readonly substituteSupplier: string;
    readonly substitutePrice: number;
  }>,
): VendorSubstitutionSuggestion[] {
  const suggestions: VendorSubstitutionSuggestion[] = [];

  for (const sub of substitutes) {
    const comparison = comparisons.find((c) => c.ingredientId === sub.ingredientId);
    const primary = comparison?.suppliers[0];
    if (!primary) continue;

    const savingsPerUnit = round2(primary.latestPrice - sub.substitutePrice);
    if (savingsPerUnit <= 0) continue;

    const savingsPercent =
      primary.latestPrice > 0
        ? round1((savingsPerUnit / primary.latestPrice) * 100)
        : 0;

    suggestions.push({
      ingredientId: sub.ingredientId,
      ingredientName: sub.ingredientName,
      primarySupplier: primary.supplierName,
      substituteIngredientId: sub.substituteIngredientId,
      substituteName: sub.substituteName,
      substituteSupplier: sub.substituteSupplier,
      savingsPerUnit,
      savingsPercent,
      reason:
        savingsPercent >= 10
          ? "Substitute saves ≥10% — consider for non-branded prep items."
          : "Approved substitute available when primary vendor is out of stock.",
    });
  }

  return suggestions.sort((a, b) => b.savingsPercent - a.savingsPercent);
}

export function buildCheaperVendorRecommendations(
  comparisons: ReadonlyArray<{
    readonly ingredientId: string;
    readonly ingredientName: string;
    readonly suppliers: ReadonlyArray<{ readonly supplierName: string; readonly latestPrice: number }>;
  }>,
  defaultOrderQty = 40,
): CheaperVendorRecommendation[] {
  const recommendations: CheaperVendorRecommendation[] = [];

  for (const row of comparisons) {
    if (row.suppliers.length < 2) continue;

    const sorted = [...row.suppliers].sort((a, b) => a.latestPrice - b.latestPrice);
    const cheapest = sorted[0]!;
    const current = sorted[sorted.length - 1]!;

    if (cheapest.supplierName === current.supplierName) continue;

    const savingsPerUnit = round2(current.latestPrice - cheapest.latestPrice);
    if (savingsPerUnit <= 0) continue;

    const savingsPercent =
      current.latestPrice > 0
        ? round1((savingsPerUnit / current.latestPrice) * 100)
        : 0;
    const savingsPerOrder = round2(savingsPerUnit * defaultOrderQty);

    recommendations.push({
      ingredientId: row.ingredientId,
      ingredientName: row.ingredientName,
      currentSupplier: current.supplierName,
      currentUnitPrice: round2(current.latestPrice),
      cheaperSupplier: cheapest.supplierName,
      cheaperUnitPrice: round2(cheapest.latestPrice),
      savingsPerOrder,
      savingsPercent,
      orderQuantity: defaultOrderQty,
      recommendation:
        savingsPercent >= 5
          ? `Switch to ${cheapest.supplierName} — save $${savingsPerOrder.toFixed(2)}/order (${savingsPercent}%).`
          : `Minor savings via ${cheapest.supplierName} — verify pack size and lead time.`,
    });
  }

  return recommendations.sort((a, b) => b.savingsPerOrder - a.savingsPerOrder);
}

export function buildVendorPriceIntelligenceReport(input: {
  priceHistory: VendorPriceHistoryPoint[];
  substitutions: VendorSubstitutionSuggestion[];
  cheaperVendors: CheaperVendorRecommendation[];
}): VendorPriceIntelligenceReport {
  const totalPotentialSavings = round2(
    input.cheaperVendors.reduce((sum, row) => sum + row.savingsPerOrder, 0) +
      input.substitutions.reduce((sum, row) => sum + row.savingsPerUnit * 40, 0),
  );

  return {
    priceHistoryCount: input.priceHistory.length,
    substitutionCount: input.substitutions.length,
    cheaperVendorCount: input.cheaperVendors.length,
    totalPotentialSavings,
    priceHistory: input.priceHistory,
    substitutions: input.substitutions,
    cheaperVendors: input.cheaperVendors,
  };
}

/** Demo fixture — deterministic vendor price intelligence without DB. */
export const VENDOR_PRICE_INTELLIGENCE_DEMO_COMPARISONS = [
  {
    ingredientId: "ing-chicken",
    ingredientName: "Chicken breast",
    suppliers: [
      { supplierName: "Sysco", latestPrice: 3.28 },
      { supplierName: "US Foods", latestPrice: 3.45 },
    ],
  },
  {
    ingredientId: "ing-oil",
    ingredientName: "Olive oil",
    suppliers: [
      { supplierName: "Restaurant Depot", latestPrice: 17.5 },
      { supplierName: "US Foods", latestPrice: 18.5 },
    ],
  },
] as const;

export const VENDOR_PRICE_INTELLIGENCE_DEMO_HISTORY_ROWS = [
  { ingredientId: "ing-chicken", ingredientName: "Chicken breast", supplierName: "US Foods", date: "2026-03-01", unitPrice: 3.52 },
  { ingredientId: "ing-chicken", ingredientName: "Chicken breast", supplierName: "US Foods", date: "2026-04-01", unitPrice: 3.45 },
  { ingredientId: "ing-chicken", ingredientName: "Chicken breast", supplierName: "Sysco", date: "2026-04-01", unitPrice: 3.28 },
  { ingredientId: "ing-oil", ingredientName: "Olive oil", supplierName: "US Foods", date: "2026-04-01", unitPrice: 18.5 },
  { ingredientId: "ing-oil", ingredientName: "Olive oil", supplierName: "Restaurant Depot", date: "2026-04-01", unitPrice: 17.5 },
] as const;

export const VENDOR_PRICE_INTELLIGENCE_DEMO_SUBSTITUTES = [
  {
    ingredientId: "ing-chicken",
    ingredientName: "Chicken breast",
    substituteIngredientId: "ing-chicken-thigh",
    substituteName: "Chicken thigh (boneless)",
    substituteSupplier: "Sysco",
    substitutePrice: 2.85,
  },
] as const;

export function buildVendorPriceIntelligenceDemoReport(): VendorPriceIntelligenceReport {
  const priceHistory = buildPriceHistoryPoints([...VENDOR_PRICE_INTELLIGENCE_DEMO_HISTORY_ROWS]);
  const substitutions = buildSubstitutionSuggestions(
    [...VENDOR_PRICE_INTELLIGENCE_DEMO_COMPARISONS],
    [...VENDOR_PRICE_INTELLIGENCE_DEMO_SUBSTITUTES],
  );
  const cheaperVendors = buildCheaperVendorRecommendations([
    ...VENDOR_PRICE_INTELLIGENCE_DEMO_COMPARISONS,
  ]);

  return buildVendorPriceIntelligenceReport({
    priceHistory,
    substitutions,
    cheaperVendors,
  });
}
