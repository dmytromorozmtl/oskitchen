import { describe, expect, it } from "vitest";

import { estimateMinCheckoutsPerArm } from "@/lib/storefront/theme-experiment-power";

describe("estimateMinCheckoutsPerArm", () => {
  it("returns reasonable N for 2pp lift at 3% baseline", () => {
    const est = estimateMinCheckoutsPerArm({
      baselineRatePercent: 3,
      targetLiftPp: 2,
      power: 0.8,
    });
    expect(est.minCheckoutsPerArm).toBeGreaterThan(100);
    expect(est.minCheckoutsPerArm).toBeLessThan(50_000);
    expect(est.headline).toContain("checkouts per arm");
  });
});
