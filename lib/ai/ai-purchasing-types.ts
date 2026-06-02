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
  confidence: number;
  suggestedAction: string;
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
  summary: {
    itemCount: number;
    criticalCount: number;
    highCount: number;
    totalEstimatedSpend: number;
    totalPotentialSavings: number;
    averageConfidence: number;
  };
  aiAssisted: true;
  confidence: number;
};
