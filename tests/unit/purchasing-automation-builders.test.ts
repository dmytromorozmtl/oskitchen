import { describe, expect, it } from "vitest";

import {
  filterAutoPurchaseCandidates,
  isEligibleForAutoPurchase,
  parsePurchasingAutomationSettings,
  resolvePoAutomationStatus,
} from "@/lib/ai/purchasing-automation-builders";
import type { PurchaseRecommendation } from "@/lib/ai/ai-purchasing-types";

function sampleRec(overrides: Partial<PurchaseRecommendation> = {}): PurchaseRecommendation {
  return {
    ingredientId: "i1",
    ingredientName: "Flour",
    unit: "lb",
    category: "Dry",
    currentStock: 2,
    reorderPoint: 8,
    dailyUsage: 3,
    predictedDemand14d: 28,
    daysRemaining: 1.5,
    urgency: "critical",
    bestSupplier: {
      supplierId: "s1",
      supplierName: "Sysco",
      supplierItemId: "si1",
      unitCost: 1.1,
      eoq: 20,
      orderQuantity: 25,
      orderTotal: 27.5,
      leadTimeDays: 2,
    },
    alternativeSupplier: null,
    confidence: 0.9,
    suggestedAction: "Order now",
    ...overrides,
  };
}

describe("isEligibleForAutoPurchase", () => {
  it("accepts high-confidence low-stock items", () => {
    const result = isEligibleForAutoPurchase(sampleRec(), { skippedIngredientIds: new Set() });
    expect(result.eligible).toBe(true);
  });

  it("rejects low confidence", () => {
    const result = isEligibleForAutoPurchase(sampleRec({ confidence: 0.7 }), {
      skippedIngredientIds: new Set(),
    });
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.includes("confidence"))).toBe(true);
  });

  it("rejects when days remaining >= 3", () => {
    const result = isEligibleForAutoPurchase(sampleRec({ daysRemaining: 4 }), {
      skippedIngredientIds: new Set(),
    });
    expect(result.eligible).toBe(false);
  });

  it("rejects skipped ingredients", () => {
    const result = isEligibleForAutoPurchase(sampleRec(), {
      skippedIngredientIds: new Set(["i1"]),
    });
    expect(result.eligible).toBe(false);
  });
});

describe("resolvePoAutomationStatus", () => {
  it("auto-approves POs at or below $500", () => {
    const plan = resolvePoAutomationStatus(450);
    expect(plan.status).toBe("APPROVED");
    expect(plan.autoApproved).toBe(true);
  });

  it("routes POs above $500 to approval workflow", () => {
    const plan = resolvePoAutomationStatus(650);
    expect(plan.status).toBe("READY_FOR_REVIEW");
    expect(plan.requiresApproval).toBe(true);
    expect(plan.approvalActions.some((a) => a.action === "SUBMITTED")).toBe(true);
  });
});

describe("filterAutoPurchaseCandidates", () => {
  it("sorts eligible by days remaining ascending", () => {
    const { eligible } = filterAutoPurchaseCandidates(
      [sampleRec({ ingredientId: "a", daysRemaining: 2 }), sampleRec({ ingredientId: "b", daysRemaining: 0.5 })],
      new Set(),
      { minConfidence: 0.85, maxDaysRemaining: 3 },
    );
    expect(eligible[0]!.ingredientId).toBe("b");
  });
});

describe("parsePurchasingAutomationSettings", () => {
  it("merges partial settings with defaults", () => {
    const settings = parsePurchasingAutomationSettings({ enabled: true });
    expect(settings.enabled).toBe(true);
    expect(settings.minConfidence).toBe(0.85);
  });
});
