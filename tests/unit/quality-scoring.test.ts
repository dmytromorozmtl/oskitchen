import { describe, expect, it } from "vitest";

import {
  buildQualityAlerts,
  buildQualityScoringSnapshot,
  buildSupplierQualityScore,
  resolveQualityTier,
} from "@/lib/marketplace/quality-scoring-builders";
import {
  QUALITY_SCORING_PATH,
  QUALITY_SCORING_POLICY_ID,
  QUALITY_SCORING_SERVICE,
  QUALITY_TIER_THRESHOLDS,
} from "@/lib/marketplace/quality-scoring-policy";
import { computeCompositeQualityScore } from "@/services/marketplace/quality-scoring";

describe("Marketplace Quality Scoring", () => {
  it("locks policy constants", () => {
    expect(QUALITY_SCORING_POLICY_ID).toBe("marketplace-quality-scoring-v1");
    expect(QUALITY_SCORING_SERVICE).toBe("services/marketplace/quality-scoring.ts");
    expect(QUALITY_SCORING_PATH).toBe("/dashboard/marketplace/quality");
    expect(QUALITY_TIER_THRESHOLDS.excellent).toBe(4.5);
  });

  it("resolves quality tiers from overall score", () => {
    expect(resolveQualityTier(null)).toBe("unrated");
    expect(resolveQualityTier(4.8)).toBe("excellent");
    expect(resolveQualityTier(4.2)).toBe("good");
    expect(resolveQualityTier(3.6)).toBe("watch");
    expect(resolveQualityTier(2.9)).toBe("avoid");
  });

  it("builds supplier quality score with tier and href", () => {
    const row = buildSupplierQualityScore({
      vendorId: "v-1",
      vendorName: "Fresh Farms",
      overall: 4.6,
      quality: 4.8,
      accuracy: 4.5,
      delivery: 4.4,
      packaging: 4.7,
      reviewCount: 12,
      orderCount: 8,
    });

    expect(row.tier).toBe("excellent");
    expect(row.href).toBe("/dashboard/marketplace/vendors/v-1");
  });

  it("builds alerts for low-rated suppliers with orders", () => {
    const alerts = buildQualityAlerts([
      buildSupplierQualityScore({
        vendorId: "v-low",
        vendorName: "Slow Supply",
        overall: 2.8,
        quality: 3,
        accuracy: 3,
        delivery: 2.5,
        packaging: 2.6,
        reviewCount: 4,
        orderCount: 2,
      }),
      buildSupplierQualityScore({
        vendorId: "v-ok",
        vendorName: "Prime Foods",
        overall: 4.4,
        quality: 4.5,
        accuracy: 4.3,
        delivery: 4.4,
        packaging: 4.4,
        reviewCount: 10,
        orderCount: 6,
      }),
    ]);

    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.vendorId).toBe("v-low");
    expect(alerts[0]?.severity).toBe("warning");
  });

  it("assembles quality scoring snapshot summary", () => {
    const workspaceSuppliers = [
      buildSupplierQualityScore({
        vendorId: "v-1",
        vendorName: "Fresh Farms",
        overall: 4.6,
        quality: 4.8,
        accuracy: 4.5,
        delivery: 4.4,
        packaging: 4.7,
        reviewCount: 12,
        orderCount: 8,
      }),
      buildSupplierQualityScore({
        vendorId: "v-2",
        vendorName: "PackCo",
        overall: 3.4,
        quality: 3.2,
        accuracy: 3.5,
        delivery: 3.3,
        packaging: 3.6,
        reviewCount: 3,
        orderCount: 2,
      }),
    ];

    const snapshot = buildQualityScoringSnapshot({
      workspaceId: "ws-1",
      workspaceSuppliers,
      topMarketplaceSuppliers: workspaceSuppliers.slice(0, 1),
      pendingReviews: [
        {
          purchaseOrderId: "po-1",
          poNumber: "PO-1001",
          vendorId: "v-2",
          vendorName: "PackCo",
          deliveredAtIso: "2026-06-01T12:00:00.000Z",
          href: "/dashboard/marketplace/orders/po-1",
        },
      ],
    });

    expect(snapshot.policyId).toBe(QUALITY_SCORING_POLICY_ID);
    expect(snapshot.basePath).toBe(QUALITY_SCORING_PATH);
    expect(snapshot.summary.ratedSuppliers).toBe(2);
    expect(snapshot.summary.excellentCount).toBe(1);
    expect(snapshot.summary.watchOrBelowCount).toBe(1);
    expect(snapshot.summary.pendingReviewCount).toBe(1);
    expect(snapshot.summary.workspaceAvgScore).toBe(4);
    expect(snapshot.alerts).toHaveLength(1);
  });

  it("computes composite quality score", () => {
    expect(
      computeCompositeQualityScore({
        quality: 5,
        accuracy: 4,
        delivery: 4,
        packaging: 3,
      }),
    ).toBe(4);
  });
});
