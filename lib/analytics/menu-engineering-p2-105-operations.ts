/**
 * Pure helpers for menu engineering matrix (Blueprint P2-105).
 */

import type { MenuEngineeringCategory } from "@/services/analytics/menu-engineering-service";

export type MenuEngineeringItem = {
  productId: string;
  productName: string;
  popularity: number;
  profitability: number;
  category: MenuEngineeringCategory;
  price: number;
  cost: number;
  recommendation: string;
};

export type QuadrantSummary = {
  category: MenuEngineeringCategory;
  label: string;
  count: number;
  avgPopularity: number;
  avgProfitability: number;
  totalRevenuePotential: number;
  action: string;
};

export type MenuEngineeringReport = {
  itemCount: number;
  starCount: number;
  plowCount: number;
  puzzleCount: number;
  dogCount: number;
  avgPopularity: number;
  avgProfitability: number;
  targetMarginPercent: number;
  items: MenuEngineeringItem[];
  quadrants: QuadrantSummary[];
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const QUADRANT_LABELS: Record<MenuEngineeringCategory, string> = {
  STAR: "Stars",
  PLOW: "Plowhorses",
  PUZZLE: "Puzzles",
  DOG: "Dogs",
};

const QUADRANT_ACTIONS: Record<MenuEngineeringCategory, string> = {
  STAR: "Promote — feature prominently, protect recipe and portion consistency.",
  PLOW: "Optimize margin — review portion size, ingredient substitutions, or price.",
  PUZZLE: "Boost visibility — train staff to suggest, add photos, bundle with Stars.",
  DOG: "Retire or rework — consider removing, rebranding, or bundling to clear inventory.",
};

export function classifyMenuEngineeringCategory(input: {
  popularity: number;
  profitability: number;
  avgPopularity: number;
  targetMarginPercent: number;
}): MenuEngineeringCategory {
  const { popularity, profitability, avgPopularity, targetMarginPercent } = input;
  if (popularity >= avgPopularity && profitability >= targetMarginPercent) return "STAR";
  if (popularity >= avgPopularity && profitability < targetMarginPercent) return "PLOW";
  if (popularity < avgPopularity && profitability >= targetMarginPercent) return "PUZZLE";
  return "DOG";
}

export function buildItemRecommendation(category: MenuEngineeringCategory): string {
  return QUADRANT_ACTIONS[category];
}

export function buildMenuEngineeringItems(
  rows: Array<{
    productId: string;
    productName: string;
    popularity: number;
    profitability: number;
    category: MenuEngineeringCategory;
    price: number;
    cost: number;
  }>,
): MenuEngineeringItem[] {
  return rows
    .map((row) => ({
      ...row,
      popularity: round1(row.popularity),
      profitability: round1(row.profitability),
      price: round2(row.price),
      cost: round2(row.cost),
      recommendation: buildItemRecommendation(row.category),
    }))
    .sort((a, b) => b.popularity - a.popularity);
}

export function buildQuadrantSummaries(items: MenuEngineeringItem[]): QuadrantSummary[] {
  const categories: MenuEngineeringCategory[] = ["STAR", "PLOW", "PUZZLE", "DOG"];

  return categories.map((category) => {
    const quadrantItems = items.filter((item) => item.category === category);
    const count = quadrantItems.length;
    const avgPopularity =
      count > 0 ? round1(quadrantItems.reduce((s, i) => s + i.popularity, 0) / count) : 0;
    const avgProfitability =
      count > 0 ? round1(quadrantItems.reduce((s, i) => s + i.profitability, 0) / count) : 0;
    const totalRevenuePotential = round2(
      quadrantItems.reduce((s, i) => s + i.price * i.popularity, 0),
    );

    return {
      category,
      label: QUADRANT_LABELS[category],
      count,
      avgPopularity,
      avgProfitability,
      totalRevenuePotential,
      action: QUADRANT_ACTIONS[category],
    };
  });
}

export function buildMenuEngineeringReport(input: {
  items: MenuEngineeringItem[];
  targetMarginPercent: number;
}): MenuEngineeringReport {
  const quadrants = buildQuadrantSummaries(input.items);
  const avgPopularity =
    input.items.length > 0
      ? round1(input.items.reduce((s, i) => s + i.popularity, 0) / input.items.length)
      : 0;
  const avgProfitability =
    input.items.length > 0
      ? round1(input.items.reduce((s, i) => s + i.profitability, 0) / input.items.length)
      : 0;

  return {
    itemCount: input.items.length,
    starCount: input.items.filter((i) => i.category === "STAR").length,
    plowCount: input.items.filter((i) => i.category === "PLOW").length,
    puzzleCount: input.items.filter((i) => i.category === "PUZZLE").length,
    dogCount: input.items.filter((i) => i.category === "DOG").length,
    avgPopularity,
    avgProfitability,
    targetMarginPercent: input.targetMarginPercent,
    items: input.items,
    quadrants,
  };
}

/** Demo fixture — deterministic menu engineering matrix without DB. */
export const MENU_ENGINEERING_DEMO_ROWS = [
  { productId: "p1", productName: "Signature burger", popularity: 142, profitability: 68, category: "STAR" as const, price: 14.5, cost: 4.64 },
  { productId: "p2", productName: "Margherita flatbread", popularity: 98, profitability: 72, category: "STAR" as const, price: 12.0, cost: 3.36 },
  { productId: "p3", productName: "House fries", popularity: 210, profitability: 58, category: "PLOW" as const, price: 5.5, cost: 2.31 },
  { productId: "p4", productName: "Caesar salad", popularity: 76, profitability: 55, category: "PLOW" as const, price: 9.0, cost: 4.05 },
  { productId: "p5", productName: "Truffle mac", popularity: 22, profitability: 71, category: "PUZZLE" as const, price: 16.0, cost: 4.64 },
  { productId: "p6", productName: "Seasonal soup", popularity: 18, profitability: 66, category: "PUZZLE" as const, price: 7.5, cost: 2.55 },
  { productId: "p7", productName: "Side coleslaw", popularity: 12, profitability: 42, category: "DOG" as const, price: 3.5, cost: 2.03 },
  { productId: "p8", productName: "Kids pasta", popularity: 8, profitability: 38, category: "DOG" as const, price: 6.0, cost: 3.72 },
] as const;

export function buildMenuEngineeringDemoReport(): MenuEngineeringReport {
  const items = buildMenuEngineeringItems([...MENU_ENGINEERING_DEMO_ROWS]);
  return buildMenuEngineeringReport({ items, targetMarginPercent: 65 });
}
