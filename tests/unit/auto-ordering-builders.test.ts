import { describe, expect, it } from "vitest";

import type { PurchaseRecommendation } from "@/lib/ai/ai-purchasing-types";
import {
  buildAutoOrderingProposal,
  combineSignals,
  computeTrendSignal,
  computeWeatherSignal,
  findUpcomingHolidaySignal,
} from "@/lib/inventory/auto-ordering-builders";
import { DEFAULT_AUTO_ORDERING_SETTINGS } from "@/lib/inventory/auto-ordering-types";

function sampleRec(overrides: Partial<PurchaseRecommendation> = {}): PurchaseRecommendation {
  return {
    ingredientId: "ing-1",
    ingredientName: "Chicken breast",
    unit: "kg",
    category: "Protein",
    currentStock: 5,
    reorderPoint: 10,
    dailyUsage: 4,
    predictedDemand14d: 70,
    daysRemaining: 1.2,
    urgency: "critical",
    bestSupplier: {
      supplierId: "sup-1",
      supplierName: "Farm Co",
      supplierItemId: "si-1",
      unitCost: 8,
      eoq: 20,
      orderQuantity: 20,
      orderTotal: 160,
      leadTimeDays: 2,
    },
    alternativeSupplier: null,
    confidence: 0.9,
    suggestedAction: "Order before weekend service.",
    ...overrides,
  };
}

describe("auto-ordering builders", () => {
  it("boosts quantity when holiday signal is active near Christmas", () => {
    const dec20 = new Date(2026, 11, 20);
    const holiday = findUpcomingHolidaySignal(dec20);
    expect(holiday).not.toBeNull();
    expect(holiday!.multiplier).toBeGreaterThan(1);
  });

  it("applies weekend weather lift", () => {
    const saturday = new Date(2026, 5, 6);
    const signal = computeWeatherSignal(saturday);
    expect(signal.multiplier).toBeGreaterThan(1);
  });

  it("detects upward trend from forecast", () => {
    const signal = computeTrendSignal(sampleRec({ dailyUsage: 2, predictedDemand14d: 40 }));
    expect(signal.multiplier).toBeGreaterThan(1);
  });

  it("builds proposal with combined multiplier", () => {
    const proposal = buildAutoOrderingProposal(
      sampleRec(),
      DEFAULT_AUTO_ORDERING_SETTINGS,
      new Date(2026, 11, 20),
    );
    expect(proposal).not.toBeNull();
    expect(proposal!.adjustedQuantity).toBeGreaterThanOrEqual(proposal!.baseQuantity);
    expect(proposal!.signals.length).toBeGreaterThan(0);
    expect(combineSignals(proposal!.signals)).toBe(proposal!.combinedMultiplier);
  });
});
