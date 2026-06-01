import { describe, expect, it } from "vitest";

import {
  buildVendorInvoiceLines,
  calculatePlanUpgradeProration,
  commissionRateForPlan,
  mergeMarketplaceBillingIntoDocuments,
  parseMarketplaceVendorBillingDocument,
  sumInvoiceLines,
  VENDOR_PLAN_MONTHLY_FEE_USD,
} from "@/lib/marketplace/billing-integration-types";

describe("marketplace billing integration types", () => {
  it("maps plan tiers to monthly SaaS fees and commission rates", () => {
    expect(VENDOR_PLAN_MONTHLY_FEE_USD.GROWTH).toBe(99);
    expect(VENDOR_PLAN_MONTHLY_FEE_USD.ENTERPRISE).toBe(299);
    expect(commissionRateForPlan("GROWTH")).toBe(3.5);
    expect(commissionRateForPlan("ENTERPRISE")).toBe(2);
  });

  it("builds SaaS + commission invoice lines", () => {
    const lines = buildVendorInvoiceLines({
      planTier: "GROWTH",
      commissionTotalUsd: 42.5,
    });
    expect(lines).toHaveLength(2);
    expect(sumInvoiceLines(lines)).toBe(141.5);
  });

  it("calculates prorated upgrade charge for remaining period days", () => {
    const periodStart = new Date("2026-06-01T00:00:00.000Z");
    const periodEnd = new Date("2026-06-30T23:59:59.999Z");
    const now = new Date("2026-06-15T12:00:00.000Z");

    const proration = calculatePlanUpgradeProration({
      currentPlan: "FREE",
      newPlan: "GROWTH",
      periodStart,
      periodEnd,
      now,
    });

    expect(proration.daysRemaining).toBeGreaterThan(0);
    expect(proration.proratedChargeUsd).toBeGreaterThan(0);
    expect(proration.proratedChargeUsd).toBeLessThan(VENDOR_PLAN_MONTHLY_FEE_USD.GROWTH);
  });

  it("persists marketplace billing document in vendor documents array", () => {
    const merged = mergeMarketplaceBillingIntoDocuments(
      [{ kind: "registration", contactEmail: "vendor@example.com" }],
      parseMarketplaceVendorBillingDocument([], "FREE"),
    );
    expect(merged).toHaveLength(2);
    expect(parseMarketplaceVendorBillingDocument(merged, "FREE").subscription.planTier).toBe("FREE");
  });
});
