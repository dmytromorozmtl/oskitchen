import { describe, expect, it } from "vitest";

import {
  ERA4_COMPLETED_CYCLES,
  ERA4_EXECUTION_MAP_STATUS,
  ERA4_SCORECARD_POLICY_ID,
  ERA4_SCORECARD_ROWS,
} from "@/lib/governance/era4-scorecard-policy";

describe("era4 scorecard policy", () => {
  it("locks era4 scorecard refresh policy id", () => {
    expect(ERA4_SCORECARD_POLICY_ID).toBe("era4-scorecard-refresh-v1");
    expect(ERA4_EXECUTION_MAP_STATUS).toBe("completed");
  });

  it("records twelve completed execution cycles", () => {
    expect(ERA4_COMPLETED_CYCLES).toHaveLength(12);
    expect(ERA4_COMPLETED_CYCLES.map((c) => c.cycle)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
  });

  it("defines era4 score deltas from era3 baseline", () => {
    const overall = ERA4_SCORECARD_ROWS.find((r) => r.area === "Overall");
    expect(overall?.era3End).toBe(73);
    expect(overall?.era4End).toBe(82);
    expect(overall?.delta).toBe(9);
  });
});
