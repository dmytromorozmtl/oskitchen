/** AI Purchasing — recommendation types (deterministic, AI-assisted). */

export type PurchasingUrgency = "critical" | "high" | "normal" | "low";

export type SupplierOfferInput = {
  supplierId: string;
  supplierName: string;
  supplierItemId: string | null;
  unitCost: number;
  purchaseUnit: string;
  packSize: number | null;
  minimumQuantity: number | null;
  leadTimeDays: number;
};

export type PurchaseSupplierChoice = {
  supplierId: string;
  supplierName: string;
  supplierItemId: string | null;
  unitCost: number;
  /** Economic order quantity (EOQ). */
  eoq: number;
  orderQuantity: number;
  orderTotal: number;
  leadTimeDays: number;
};

export type PurchaseAlternativeSupplier = PurchaseSupplierChoice & {
  savingsPerOrder: number;
  savingsPercent: number;
};

export type ShortagePrediction = {
  predictedShortageQty: number;
  shortageDateIso: string | null;
  daysUntilShortage: number | null;
  coverageGapDays: number;
};

export type PriceOptimizationRecommendation = "switch_supplier" | "bulk_up" | "hold" | "order_now";

export type PriceOptimization = {
  optimizedUnitCost: number;
  currentBestUnitCost: number;
  savingsPerUnit: number;
  savingsPerOrder: number;
  recommendation: PriceOptimizationRecommendation;
  rationale: string;
};

/** Per-ingredient purchase recommendation with supplier economics. */
export type PurchaseRecommendation = {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  category: string | null;
  currentStock: number;
  reorderPoint: number | null;
  dailyUsage: number;
  predictedDemand14d: number;
  daysRemaining: number | null;
  urgency: PurchasingUrgency;
  bestSupplier: PurchaseSupplierChoice;
  alternativeSupplier: PurchaseAlternativeSupplier | null;
  shortagePrediction: ShortagePrediction;
  priceOptimization: PriceOptimization;
  confidence: number;
  suggestedAction: string;
};

export type AiPurchasingDailyBriefShortage = {
  ingredientName: string;
  daysUntilShortage: number | null;
  predictedShortageQty: number;
};

export type AiPurchasingDailyBriefSaving = {
  ingredientName: string;
  supplierName: string;
  savingsPerOrder: number;
};

export type AiPurchasingDailyBrief = {
  generatedAtIso: string;
  headline: string;
  executiveSummary: string;
  topShortages: AiPurchasingDailyBriefShortage[];
  topSavings: AiPurchasingDailyBriefSaving[];
  priceSwitchCount: number;
  orderTodayCount: number;
  bullets: string[];
};

export type IngredientPurchasingInput = {
  ingredientId: string;
  name: string;
  unit: string;
  category: string | null;
  currentStock: number;
  reorderPoint: number | null;
  parLevel: number;
  defaultSupplierName: string | null;
  defaultUnitCost: number;
  demandRequired: number;
  forecast14d: number | null;
  supplierOffers: SupplierOfferInput[];
};

export type AiPurchasingResult = {
  workspaceId: string;
  analyzedAt: string;
  forecastHorizonDays: 14;
  recommendations: PurchaseRecommendation[];
  dailyBrief: AiPurchasingDailyBrief;
  summary: {
    itemCount: number;
    criticalCount: number;
    highCount: number;
    totalEstimatedSpend: number;
    totalPotentialSavings: number;
    averageConfidence: number;
    shortageCount: number;
    priceSwitchCount: number;
  };
  aiAssisted: true;
  confidence: number;
};
