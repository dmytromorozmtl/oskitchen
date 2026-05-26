import { describe, expect, it } from "vitest";

import {
  experimentLiftPercentPoints,
  twoProportionSignificance,
} from "@/lib/storefront/theme-experiment-significance";

describe("theme experiment significance", () => {
  it("experimentLiftPercentPoints computes delta", () => {
    expect(experimentLiftPercentPoints(10, 15)).toBe(5);
    expect(experimentLiftPercentPoints(20, 18)).toBe(-2);
  });

  it("twoProportionSignificance requires min per arm", () => {
    const r = twoProportionSignificance({
      published: { successes: 10, trials: 50 },
      draft: { successes: 15, trials: 50 },
      minPerArm: 100,
    });
    expect(r.sampleSizeOk).toBe(false);
    expect(r.significant).toBe(false);
  });

  it("twoProportionSignificance detects large lift", () => {
    const r = twoProportionSignificance({
      published: { successes: 50, trials: 200 },
      draft: { successes: 90, trials: 200 },
      minPerArm: 100,
    });
    expect(r.sampleSizeOk).toBe(true);
    expect(r.significant).toBe(true);
    expect(r.pValue).toBeLessThan(0.05);
  });
});
