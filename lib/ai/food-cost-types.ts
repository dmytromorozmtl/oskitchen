/** Food Cost AI — analysis types (deterministic, AI-assisted). */

export type PriceTrend = "up" | "down" | "stable";

export type IngredientCostBreakdown = {
  ingredientId: string;
  name: string;
  unit: string;
  currentCostPerUnit: number;
  previousCostPerUnit: number | null;
  priceChangePercent: number | null;
  priceTrend: PriceTrend;
  /** Share of this item's ingredient cost (0–100). */
  shareOfRecipeCostPercent: number;
  /** Menu items using this ingredient in active recipes. */
  usedInProductCount: number;
};

export type FoodCostItemAnalysis = {
  productId: string;
  itemTitle: string;
  salePrice: number;
  foodCostPercent: number;
  grossMarginPercent: number;
  ingredientCost: number;
  laborCost: number;
  totalCost: number;
  targetFoodCostPercent: number;
  targetMarginPercent: number;
  marginGapPercent: number;
  warningLevel: string;
  recommendation: string;
  suggestedPrice: number | null;
  ingredientBreakdown: IngredientCostBreakdown[];
};

export type FoodCostAnalysis = {
  workspaceId: string;
  analyzedAt: string;
  overallFoodCostPercent: number;
  overallGrossMarginPercent: number;
  targetFoodCostPercent: number;
  targetMarginPercent: number;
  itemsAnalyzed: number;
  itemsBelowTargetMargin: number;
  itemAnalyses: FoodCostItemAnalysis[];
  /** Top ingredient price movers across the workspace (by abs % change). */
  topIngredientMovers: IngredientCostBreakdown[];
  recommendations: string[];
  /** AI-assisted — based on recipe cards and supplier price history quality. */
  aiAssisted: true;
  confidence: number;
};

export type IngredientPricePoint = {
  ingredientId: string;
  name: string;
  unit: string;
  currentCostPerUnit: number;
  previousCostPerUnit: number | null;
  usedInProductCount: number;
};

export type CostingLineInput = {
  productId: string;
  itemTitle: string;
  salePrice: number;
  ingredientCost: number;
  laborCost: number;
  totalCost: number;
  grossMarginPercent: number;
  foodCostPercent: number;
  suggestedPrice: number | null;
  warningLevel: string;
};

export type RecipeIngredientInput = {
  productId: string;
  ingredientId: string;
  ingredientName: string;
  unit: string;
  quantity: number;
  wastePercent: number;
  costPerUnit: number;
  yieldQuantity: number;
};
