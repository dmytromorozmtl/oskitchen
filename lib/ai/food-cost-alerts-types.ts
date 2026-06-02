export type FoodCostAlertType = "low_margin" | "ingredient_price_spike";

export type FoodCostAlertSeverity = "critical" | "warning" | "info";

/** Food cost alert — margin or ingredient price threshold breach with dollar impact. */
export type FoodCostAlert = {
  id: string;
  type: FoodCostAlertType;
  severity: FoodCostAlertSeverity;
  title: string;
  description: string;
  /** Estimated weekly dollar impact if unaddressed. */
  impact: number;
  confidence: number;
  suggestedAction: string;
  expiresAt: Date;
  productId?: string;
  ingredientId?: string;
};

export const FOOD_COST_MARGIN_ALERT_THRESHOLD = 30;
export const FOOD_COST_INGREDIENT_SPIKE_THRESHOLD = 10;
