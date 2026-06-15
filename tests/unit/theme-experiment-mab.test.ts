import { describe, expect, it } from "vitest";

import { buildMabStateFromMetrics, thompsonSelectArm } from "@/lib/storefront/theme-experiment-mab";

describe("theme-experiment-mab", () => {
  it("thompson select is sticky per visitor", () => {
    const arms = [
      { armId: "published", alpha: 10, beta: 90, successes: 10, trials: 100 },
      { armId: "draft", alpha: 15, beta: 85, successes: 15, trials: 100 },
    ];
    const a1 = thompsonSelectArm({ arms, visitorId: "visitor-1" });
    const a2 = thompsonSelectArm({ arms, visitorId: "visitor-1" });
    expect(a1).toBe(a2);
  });

  it("buildMabStateFromMetrics computes exploration", () => {
    const snap = buildMabStateFromMetrics(
      [
        { id: "published", weight: 50 },
        { id: "draft", weight: 50 },
      ],
      [
        { arm: "published", conversions: 10, checkouts: 100 },
        { arm: "draft", conversions: 12, checkouts: 100 },
      ],
    );
    expect(snap.arms).toHaveLength(2);
    expect(snap.explorationPercent).toBeGreaterThanOrEqual(0);
  });
});
