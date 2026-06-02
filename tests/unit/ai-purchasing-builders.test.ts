import { describe, expect, it } from "vitest";

import {
  assembleAiPurchasingResult,
  buildPurchaseRecommendation,
  computeDailyUsage,
  computeDaysRemaining,
  computeEoq,
  computePredictedDemand14d,
  urgencyFromDaysRemaining,
} from "@/lib/ai/ai-purchasing-builders";
import type { IngredientPurchasingInput } from "@/lib/ai/ai-purchasing-types";

const baseInput: IngredientPurchasingInput = {
  ingredientId: "ing-1",
  name: "Chicken breast",
  unit: "lb",
  category: "Protein",
  currentStock: 10,
  reorderPoint: 15,
  parLevel: 30,
  defaultSupplierName: "Sysco",
  defaultUnitCost: 3.5,
  demandRequired: 42,
  forecast14d: null,
  supplierOffers: [
    {
      supplierId: "s1",
      supplierName: "Sysco",
      supplierItemId: "si-1",
      unitCost: 3.4,
      purchaseUnit: "lb",
      packSize: 10,
      minimumQuantity: 10,
      leadTimeDays: 2,
    },
    {
      supplierId: "s2",
      supplierName: "US Foods",
      supplierItemId: "si-2",
      unitCost: 3.8,
      purchaseUnit: "lb",
      packSize: null,
      minimumQuantity: null,
      leadTimeDays: 3,
    },
  ],
};

describe("computeEoq", () => {
  it("returns positive EOQ for valid demand", () => {
    const eoq = computeEoq(5, 4);
    expect(eoq).toBeGreaterThan(0);
  });

  it("returns 0 when demand or cost is zero", () => {
    expect(computeEoq(0, 4)).toBe(0);
    expect(computeEoq(5, 0)).toBe(0);
  });
});

describe("computeDailyUsage", () => {
  it("divides demand by window days", () => {
    expect(computeDailyUsage(21, 7)).toBe(3);
  });
});

describe("computePredictedDemand14d", () => {
  it("uses forecast when provided", () => {
    expect(computePredictedDemand14d(2, 50)).toBe(50);
  });

  it("falls back to dailyUsage × 14", () => {
    expect(computePredictedDemand14d(2, null)).toBe(28);
  });
});

describe("urgencyFromDaysRemaining", () => {
  it("marks critical when below half lead time", () => {
    expect(urgencyFromDaysRemaining(1, 3)).toBe("critical");
  });

  it("marks high when within lead time", () => {
    expect(urgencyFromDaysRemaining(3, 3)).toBe("high");
  });
});

describe("buildPurchaseRecommendation", () => {
  it("builds recommendation with best and alternative supplier", () => {
    const rec = buildPurchaseRecommendation(baseInput, 14);
    expect(rec).not.toBeNull();
    expect(rec!.bestSupplier.supplierName).toBe("Sysco");
    expect(rec!.dailyUsage).toBe(3);
    expect(rec!.predictedDemand14d).toBe(42);
    expect(rec!.bestSupplier.eoq).toBeGreaterThan(0);
    expect(rec!.alternativeSupplier).not.toBeNull();
    expect(rec!.alternativeSupplier!.supplierName).toBe("US Foods");
  });

  it("returns null when stock is healthy and no usage", () => {
    const rec = buildPurchaseRecommendation(
      {
        ...baseInput,
        currentStock: 100,
        parLevel: 20,
        demandRequired: 0,
        forecast14d: null,
      },
      14,
    );
    expect(rec).toBeNull();
  });
});

describe("assembleAiPurchasingResult", () => {
  it("sorts by urgency and summarizes spend", () => {
    const rec = buildPurchaseRecommendation(baseInput, 14)!;
    const result = assembleAiPurchasingResult({
      workspaceId: "ws-1",
      recommendations: [rec],
      analyzedAt: new Date("2026-06-01"),
    });
    expect(result.summary.itemCount).toBe(1);
    expect(result.summary.totalEstimatedSpend).toBeGreaterThan(0);
    expect(result.aiAssisted).toBe(true);
    expect(result.forecastHorizonDays).toBe(14);
  });
});

describe("computeDaysRemaining", () => {
  it("computes days from stock and usage", () => {
    expect(computeDaysRemaining(10, 2)).toBe(5);
    expect(computeDaysRemaining(10, 0)).toBeNull();
  });
});
