import type { Ingredient, Order, OrderItem, Recipe, RecipeIngredient } from "@prisma/client";

/** Demand source identifiers — persisted on runs and in kitchen settings JSON. */
export const DEMAND_SOURCE_TYPES = [
  "CONFIRMED_ORDERS",
  "DRAFT_ORDERS",
  "STOREFRONT_PREORDERS",
  "PRODUCTION_PLAN",
  "MENU_FORECAST",
  "CATERING_EVENTS",
  "BAKERY_BATCHES",
  "BAR_PREP",
  "CAFE_SPECIALS",
  "MANUAL_PLAN",
  "HISTORICAL_FORECAST",
] as const;

export type DemandSourceType = (typeof DEMAND_SOURCE_TYPES)[number];

export type OrderWithItems = Pick<Order, "id" | "status" | "pickupDate" | "createdAt" | "brandId" | "locationId"> & {
  orderItems: Pick<OrderItem, "quantity" | "productId">[];
};

export type RecipeWithLines = Recipe & {
  ingredients: (RecipeIngredient & { ingredient: Ingredient })[];
};

/** Row shape used by Purchasing CSV and legacy demand table views. */
export type IngredientDemandRow = {
  ingredientId: string;
  name: string;
  category: string | null;
  unit: string;
  dateKey: string;
  required: number;
  stock: number;
  shortage: number;
  supplier: string | null;
  relatedProducts: string[];
  /** When unit conversion to ingredient storage unit failed, shortage is not computed numerically. */
  conversionRequired?: boolean;
  /** Rough line estimate when cost and units align; optional for exports. */
  estimatedCost?: number | null;
};

export type DemandWarning = {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
  context?: Record<string, string | number | boolean | null | undefined>;
};

export type MissingRecipeSignal = {
  productId: string;
  productTitle: string;
  reason: "NO_RECIPE" | "RECIPE_INACTIVE" | "NO_INGREDIENTS";
};

export type DemandContribution = {
  productId: string;
  quantity: number;
  dateKey: string;
  source: DemandSourceType;
  confidence: number;
  orderId?: string;
  productionBatchId?: string;
  productionBatchTitle?: string;
  menuId?: string | null;
  brandId?: string | null;
  locationId?: string | null;
  productTitle?: string;
};
