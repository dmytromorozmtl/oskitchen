/** Food Cost analytics dashboard payload types. */

import type { FoodCostAlert } from "@/lib/ai/food-cost-alerts-types";
import type { FoodCostAnalysis } from "@/lib/ai/food-cost-types";

export type FoodCostTrendPoint = {
  date: string;
  foodCostPercent: number;
  marginPercent: number;
  sampleSize: number;
};

export type IngredientPriceSeries = {
  ingredientId: string;
  name: string;
  unit: string;
  currentPrice: number;
  changePercent: number | null;
  points: { date: string; price: number }[];
};

export type WasteSummaryPayload = {
  totalEvents: number;
  totalCost: number;
  byReason: Record<string, { count: number; totalCost: number }>;
  events: Array<{
    id: string;
    reason: string;
    quantity: number;
    unit: string;
    cost: number;
    createdAt: string;
    ingredientName: string;
  }>;
};

export type FoodCostDashboardPayload = {
  analysis: FoodCostAnalysis;
  alerts: FoodCostAlert[];
  trend30d: FoodCostTrendPoint[];
  ingredientPriceSeries: IngredientPriceSeries[];
  waste: WasteSummaryPayload;
};
