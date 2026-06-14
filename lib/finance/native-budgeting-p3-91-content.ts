/**
 * P3-91 — Default restaurant budget categories (R365-style prime cost model).
 *
 * @see docs/native-budgeting-p3-91.md
 */

import type { NativeBudgetCategoryTarget } from "@/lib/finance/native-budgeting-types";
import { NATIVE_BUDGETING_P3_91_MIN_CATEGORIES } from "@/lib/finance/native-budgeting-p3-91-policy";

export const NATIVE_BUDGETING_P3_91_HONESTY_NOTE =
  "Native budgeting compares live POS and kitchen actuals to operator-set targets — not a GL replacement or accountant workflow. QuickBooks journal sync remains optional for full R365-class reconciliation." as const;

/** Restaurant365-style category defaults — percent of revenue. */
export const NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES: readonly NativeBudgetCategoryTarget[] = [
  {
    key: "food_cost",
    label: "Food cost",
    percentOfRevenue: 0.3,
    description: "Ingredient and recipe cost from kitchen snapshots vs sales.",
  },
  {
    key: "labor",
    label: "Labor cost",
    percentOfRevenue: 0.3,
    description: "Scheduled shifts and time-clock hours vs revenue.",
  },
  {
    key: "occupancy",
    label: "Occupancy",
    percentOfRevenue: 0.08,
    description: "Rent, utilities, and occupancy allocation.",
  },
  {
    key: "supplies",
    label: "Operating supplies",
    percentOfRevenue: 0.04,
    description: "Smallwares, disposables, and operating supplies.",
  },
  {
    key: "repairs",
    label: "Repairs & maintenance",
    percentOfRevenue: 0.02,
    description: "Equipment repair and facility maintenance.",
  },
  {
    key: "marketing",
    label: "Marketing",
    percentOfRevenue: 0.05,
    description: "Paid ads, promos, and local marketing spend.",
  },
  {
    key: "admin",
    label: "Admin & G&A",
    percentOfRevenue: 0.06,
    description: "Software, insurance, and general admin overhead.",
  },
  {
    key: "ebitda",
    label: "EBITDA target",
    percentOfRevenue: 0.15,
    description: "Operating profit target before interest, tax, depreciation.",
  },
  {
    key: "net_income",
    label: "Net income target",
    percentOfRevenue: 0.12,
    description: "Estimated net after typical below-the-line adjustments.",
  },
] as const;

export function nativeBudgetingMeetsMinCategories(): boolean {
  return NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES.length >= NATIVE_BUDGETING_P3_91_MIN_CATEGORIES;
}

export function nativeBudgetingPrimeCostTarget(): number {
  const food = NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES.find((c) => c.key === "food_cost");
  const labor = NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES.find((c) => c.key === "labor");
  return (food?.percentOfRevenue ?? 0) + (labor?.percentOfRevenue ?? 0);
}
