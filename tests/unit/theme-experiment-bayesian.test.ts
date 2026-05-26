import { describe, expect, it } from "vitest";

import { evaluateBayesianExperimentDecision } from "@/lib/storefront/theme-experiment-bayesian";

describe("evaluateBayesianExperimentDecision", () => {
  it("returns posteriors for two arms", () => {
    const d = evaluateBayesianExperimentDecision({
      arms: [
        { armId: "published", conversions: 50, checkouts: 1000 },
        { armId: "draft", conversions: 70, checkouts: 1000 },
      ],
      thresholdPp: 2,
    });
    expect(d.posteriors).toHaveLength(2);
    if (d.enabled) expect(d.liftPp).toBeGreaterThan(0);
  });
});
