import { describe, expect, it } from "vitest";

import {
  currentBillingPeriodMonth,
  loadPartnerBillingConfig,
  normalizePublisherKey,
  resetPartnerBillingConfigCache,
  resolvePartnerBillingRates,
} from "@/lib/platform/partner-billing-config";

describe("partner-billing config", () => {
  it("loads billing config with app rate overrides", () => {
    resetPartnerBillingConfigCache();
    const config = loadPartnerBillingConfig();
    expect(config.apps.length).toBeGreaterThan(0);
    expect(config.defaultRevenueShareBps).toBeGreaterThan(0);
  });

  it("normalizes publisher keys consistently", () => {
    expect(normalizePublisherKey("KitchenOS Certified SI — OpsBridge")).toBe(
      "kitchenos-certified-si-opsbridge",
    );
  });

  it("resolves per-app billing rates", () => {
    resetPartnerBillingConfigCache();
    const rates = resolvePartnerBillingRates({
      clientId: "sandbox-opsbridge-connector",
      publisher: "KitchenOS Certified SI — OpsBridge",
    });
    expect(rates.publisherKey).toBe("kitchenos-certified-si-opsbridge");
    expect(rates.revenueShareBps).toBe(2000);
    expect(rates.monthlyPlatformFeeCentsPerInstall).toBe(500);
  });

  it("formats current billing period month", () => {
    expect(currentBillingPeriodMonth(new Date("2026-05-15T12:00:00.000Z"))).toBe("2026-05");
  });
});
