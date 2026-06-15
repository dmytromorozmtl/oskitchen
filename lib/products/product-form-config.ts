import type { BusinessType } from "@prisma/client";

import type { OperatingMode } from "@/lib/operating-modes/types";
import { getOperatingModeForBusinessType } from "@/lib/operating-modes/resolver";
import { formatCategoryCodeLabel } from "@/lib/products/category-code";

/** Built-in category codes (also valid in DB as Product.category varchar). */
export const BUILTIN_PRODUCT_CATEGORIES = [
  "MAINS",
  "SIDES",
  "BAKERY",
  "BEVERAGES",
  "BREAKFAST",
  "DESSERTS",
  "SNACKS",
  "BAR",
  "OTHER",
] as const;

export type BuiltinProductCategory = (typeof BUILTIN_PRODUCT_CATEGORIES)[number];

const CATEGORY_LABELS: Record<BuiltinProductCategory, string> = {
  MAINS: "Mains",
  SIDES: "Sides",
  BAKERY: "Bakery",
  BEVERAGES: "Beverages",
  BREAKFAST: "Breakfast",
  DESSERTS: "Desserts",
  SNACKS: "Snacks",
  BAR: "Bar & cocktails",
  OTHER: "Other",
};

const CATEGORIES_BY_MODE: Record<OperatingMode, BuiltinProductCategory[]> = {
  WEEKLY_PREORDER: [
    "MAINS",
    "SIDES",
    "BAKERY",
    "BEVERAGES",
    "BREAKFAST",
    "DESSERTS",
    "SNACKS",
    "OTHER",
  ],
  DAILY_SERVICE: [
    "MAINS",
    "SIDES",
    "BAKERY",
    "BEVERAGES",
    "BREAKFAST",
    "DESSERTS",
    "SNACKS",
    "BAR",
    "OTHER",
  ],
};

export function resolveOperatingMode(
  businessType: BusinessType | null | undefined,
): OperatingMode {
  return getOperatingModeForBusinessType(businessType ?? undefined);
}

export function isWeeklyPreorderMode(mode: OperatingMode): boolean {
  return mode === "WEEKLY_PREORDER";
}

export function getBuiltinCategoryCodes(mode: OperatingMode): BuiltinProductCategory[] {
  return CATEGORIES_BY_MODE[mode];
}

/** @deprecated Use getBuiltinCategoryCodes */
export function getProductFormCategories(mode: OperatingMode): BuiltinProductCategory[] {
  return getBuiltinCategoryCodes(mode);
}

export function isBuiltinCategoryCode(code: string): boolean {
  return (BUILTIN_PRODUCT_CATEGORIES as readonly string[]).includes(code);
}

export function getProductCategoryLabel(category: string): string {
  if (isBuiltinCategoryCode(category)) {
    return CATEGORY_LABELS[category as BuiltinProductCategory];
  }
  return formatCategoryCodeLabel(category);
}

export function getProductTitlePlaceholder(
  mode: OperatingMode,
  businessType: BusinessType | null | undefined,
): string {
  if (!isWeeklyPreorderMode(mode)) {
    switch (businessType) {
      case "BAR":
        return "Espresso martini";
      case "CAFE":
        return "Oat milk latte";
      case "BAKERY":
        return "Sourdough loaf";
      default:
        return "Margherita pizza";
    }
  }
  return "Harissa lamb bowl";
}

export function getAddProductDialogTitle(mode: OperatingMode): string {
  return isWeeklyPreorderMode(mode) ? "New meal" : "New product";
}

export function getCreateProductSubmitLabel(mode: OperatingMode): string {
  return isWeeklyPreorderMode(mode) ? "Add meal" : "Add product";
}

export function getProductCreatedToast(mode: OperatingMode): string {
  return isWeeklyPreorderMode(mode) ? "Meal created" : "Product created";
}
