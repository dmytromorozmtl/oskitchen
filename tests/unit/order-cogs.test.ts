import { describe, expect, it } from "vitest";

import {
  DEFAULT_FOOD_COST_RATIO,
  orderTotalCost,
  resolveLineCogs,
  resolveOrderLinesCogs,
  type ProductCogsRecord,
} from "@/lib/costing/order-cogs";

const BURGER_COGS: ProductCogsRecord = {
  productId: "prod-burger",
  ingredientCostPerUnit: 3,
  laborCostPerUnit: 1,
  packagingCostPerUnit: 0.5,
  primeCostPerUnit: 4.5,
  source: "profitability_line",
};

function cogsMap(...records: ProductCogsRecord[]) {
  return new Map(records.map((r) => [r.productId, r]));
}

describe("order-cogs", () => {
  it("uses recipe ingredient + prime cost when product is in costing map", () => {
    const map = cogsMap(BURGER_COGS);
    const result = resolveLineCogs(
      { productId: "prod-burger", quantity: 2, unitPrice: 10, lineTotal: 20 },
      map,
    );
    expect(result.source).toBe("recipe");
    expect(result.foodCost).toBe(6);
    expect(result.primeCost).toBe(9);
    expect(result.revenue).toBe(20);
  });

  it("falls back to ratio estimate when product has no recipe cost", () => {
    const result = resolveLineCogs(
      { productId: "unknown", quantity: 1, unitPrice: 10, lineTotal: 10 },
      new Map(),
    );
    expect(result.source).toBe("estimated");
    expect(result.foodCost).toBe(3.2);
    expect(result.primeCost).toBe(3.2);
  });

  it("aggregates mixed recipe and estimated lines on an order", () => {
    const map = cogsMap(BURGER_COGS);
    const result = resolveOrderLinesCogs(
      [
        { productId: "prod-burger", quantity: 1, unitPrice: 10, lineTotal: 10 },
        { productId: "unknown", quantity: 1, unitPrice: 10, lineTotal: 10 },
      ],
      20,
      map,
    );
    expect(result.recipeBackedLines).toBe(1);
    expect(result.totalLines).toBe(2);
    expect(result.foodCost).toBe(6.2);
    expect(result.primeCost).toBe(7.7);
  });

  it("estimates order-level cost when no line items exist", () => {
    const result = resolveOrderLinesCogs([], 100, new Map());
    expect(result.foodCost).toBe(32);
    expect(result.primeCost).toBe(32);
    expect(result.totalLines).toBe(0);
  });

  it("adds delivery surcharge via orderTotalCost", () => {
    expect(orderTotalCost(10, false, 4.5)).toBe(10);
    expect(orderTotalCost(10, true, 4.5)).toBe(14.5);
  });

  it("uses default food cost ratio of 32%", () => {
    expect(DEFAULT_FOOD_COST_RATIO).toBe(0.32);
  });
});
