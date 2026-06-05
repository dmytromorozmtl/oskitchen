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

export type PriceRecommendationAction = "raise_price" | "lower_portion" | "hold" | "review";

export type PriceRecommendation = {
  action: PriceRecommendationAction;
  recommendedPrice: number | null;
  currentPrice: number;
  expectedMarginPercent: number;
  expectedProfitPerItem: number;
  rationale: string;
};

export type FoodCostItemAnalysis = {
  productId: string;
  itemTitle: string;
  salePrice: number;
  foodCostPercent: number;
  grossMarginPercent: number;
  /** Real-time margin from latest ingredient costs and current menu price. */
  realTimeMarginPercent: number;
  ingredientCost: number;
  laborCost: number;
  totalCost: number;
  profitPerItem: number;
  unitsSold7d: number;
  weeklyProfitEstimate: number;
  targetFoodCostPercent: number;
  targetMarginPercent: number;
  marginGapPercent: number;
  warningLevel: string;
  recommendation: string;
  suggestedPrice: number | null;
  priceRecommendation: PriceRecommendation;
  ingredientBreakdown: IngredientCostBreakdown[];
};

export type FoodCostManagerDailyBrief = {
  generatedAtIso: string;
  headline: string;
  executiveSummary: string;
  bullets: string[];
  itemsNeedingPriceBump: number;
  avgProfitPerItem: number;
};

export type FoodCostPriceRecommendationRow = {
  productId: string;
  itemTitle: string;
  profitPerItem: number;
  priceRecommendation: PriceRecommendation;
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
  dailyBrief: FoodCostManagerDailyBrief;
  topPriceRecommendations: FoodCostPriceRecommendationRow[];
  /** Top ingredient price movers across the workspace (by abs % change). */
  topIngredientMovers: IngredientCostBreakdown[];
  recommendations: string[];
  summary: {
    avgProfitPerItem: number;
    weeklyProfitEstimate: number;
    priceBumpCount: number;
  };
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
