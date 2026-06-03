import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  assessDynamicPricingReadiness,
  DYNAMIC_PRICING_VALIDATION_POLICY_ID,
  validateDynamicPricingAbLift,
  validateDynamicPricingPrice,
  validateDynamicPricingSuggestionIntegrity,
} from "@/lib/ai/dynamic-pricing-validation";

const ROOT = process.cwd();

describe("dynamic pricing validation", () => {
  it("accepts price changes within ±12% / -8% bounds", () => {
    const ok = validateDynamicPricingPrice({ currentPrice: 10, proposedPrice: 11 });
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.changePercent).toBe(10);
    }
  });

  it("rejects increases above +12%", () => {
    const result = validateDynamicPricingPrice({ currentPrice: 10, proposedPrice: 11.5 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("above_max");
  });

  it("rejects decreases below -8%", () => {
    const result = validateDynamicPricingPrice({ currentPrice: 10, proposedPrice: 9 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("below_min");
  });

  it("rejects stale client suggestions", () => {
    const result = validateDynamicPricingSuggestionIntegrity({
      currentPrice: 10,
      clientSuggestedPrice: 10.5,
      serverSuggestedPrice: 10.6,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("stale_suggestion");
  });

  it("caps A/B lift at 12%", () => {
    expect(validateDynamicPricingAbLift(5).ok).toBe(true);
    const high = validateDynamicPricingAbLift(15);
    expect(high.ok).toBe(false);
    if (!high.ok) expect(high.code).toBe("ab_lift_too_high");
  });

  it("requires minimum order lines for qualified readiness", () => {
    expect(assessDynamicPricingReadiness(120).qualified).toBe(true);
    expect(assessDynamicPricingReadiness(10).qualified).toBe(false);
  });

  it("wires validation into dynamic pricing service apply path", () => {
    const service = readFileSync(join(ROOT, "services/ai/dynamic-pricing-service.ts"), "utf8");
    expect(service).toContain("validateDynamicPricingSuggestionIntegrity");
    expect(service).toContain("validateDynamicPricingAbLift");
    expect(service).toContain("assertDynamicPricingValidation");
    expect(DYNAMIC_PRICING_VALIDATION_POLICY_ID).toBe("dynamic-pricing-validation-v1");
  });
});
