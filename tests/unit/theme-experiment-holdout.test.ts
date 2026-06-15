import { describe, expect, it } from "vitest";

import { armFromHoldoutBucket } from "@/lib/storefront/theme-experiment-bucket";
import { isPostWinnerHoldoutActive, readPostWinnerHoldoutPercent } from "@/lib/storefront/theme-experiment-holdout";

describe("post-winner holdout", () => {
  it("reads holdout percent capped 0-20", () => {
    expect(readPostWinnerHoldoutPercent({ postWinnerHoldoutPercent: 25 })).toBe(20);
    expect(readPostWinnerHoldoutPercent({ postWinnerHoldoutPercent: 7 })).toBe(7);
  });

  it("active when concluded with holdout", () => {
    expect(
      isPostWinnerHoldoutActive({
        enabled: false,
        concludedAt: "2026-01-01T00:00:00.000Z",
        postWinnerHoldoutPercent: 5,
      }),
    ).toBe(true);
  });

  it("assigns published control for low buckets", () => {
    expect(armFromHoldoutBucket(5, 10)).toBe("published");
    expect(armFromHoldoutBucket(15, 10)).toBe("draft");
  });
});
