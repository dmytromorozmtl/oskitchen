import { describe, expect, it } from "vitest";

import {
  INSTANT_PAYOUT_MIN_USD,
  calculateInstantPayoutFee,
  evaluateInstantPayoutEligibility,
  instantPayoutFeePercent,
} from "@/lib/marketplace/instant-payouts-policy";

describe("instant-payouts-service policy", () => {
  it("charges tiered instant fees", () => {
    expect(instantPayoutFeePercent("FREE")).toBeNull();
    expect(instantPayoutFeePercent("GROWTH")).toBe(1.5);
    expect(instantPayoutFeePercent("ENTERPRISE")).toBe(1);
    expect(calculateInstantPayoutFee(100, 1.5)).toBe(1.5);
    expect(calculateInstantPayoutFee(10, 1.5)).toBe(0.5);
  });

  it("requires Growth+, balance, and connect readiness", () => {
    const blocked = evaluateInstantPayoutEligibility({
      planTier: "FREE",
      connectStatus: "ready",
      availableBalance: 100,
      openDisputeCount: 0,
      instantPayoutsToday: 0,
      accountAgeDays: 60,
      lifetimeGmvUsd: 2000,
      featureFlagEnabled: true,
    });
    expect(blocked.eligible).toBe(false);
    expect(blocked.reasons.some((r) => r.includes("Growth"))).toBe(true);

    const ok = evaluateInstantPayoutEligibility({
      planTier: "GROWTH",
      connectStatus: "ready",
      availableBalance: 100,
      openDisputeCount: 0,
      instantPayoutsToday: 0,
      accountAgeDays: 60,
      lifetimeGmvUsd: 2000,
      featureFlagEnabled: true,
    });
    expect(ok.eligible).toBe(true);
    expect(ok.estimatedMinutes).toBe(30);
  });

  it("blocks low balance and daily cap", () => {
    const low = evaluateInstantPayoutEligibility({
      planTier: "GROWTH",
      connectStatus: "ready",
      availableBalance: INSTANT_PAYOUT_MIN_USD - 1,
      openDisputeCount: 0,
      instantPayoutsToday: 0,
      accountAgeDays: 60,
      lifetimeGmvUsd: 2000,
      featureFlagEnabled: true,
    });
    expect(low.eligible).toBe(false);

    const capped = evaluateInstantPayoutEligibility({
      planTier: "GROWTH",
      connectStatus: "ready",
      availableBalance: 500,
      openDisputeCount: 0,
      instantPayoutsToday: 3,
      accountAgeDays: 60,
      lifetimeGmvUsd: 2000,
      featureFlagEnabled: true,
    });
    expect(capped.eligible).toBe(false);
  });
});
