import { describe, expect, it } from "vitest";

import {
  ERA5_COMPLETED_CYCLES,
  ERA5_EXECUTION_MAP_STATUS,
  ERA5_SCORECARD_POLICY_ID,
  ERA5_SCORECARD_ROWS,
} from "@/lib/governance/era5-scorecard-policy";

describe("era5 scorecard policy", () => {
  it("locks era5 scorecard refresh policy id", () => {
    expect(ERA5_SCORECARD_POLICY_ID).toBe("era5-scorecard-refresh-v1");
    expect(ERA5_EXECUTION_MAP_STATUS).toBe("completed");
  });

  it("records five completed P0 cycles", () => {
    expect(ERA5_COMPLETED_CYCLES).toHaveLength(5);
    expect(ERA5_COMPLETED_CYCLES.map((c) => c.cycle)).toEqual([1, 2, 3, 4, 5]);
  });

  it("defines era5 score deltas from era4 baseline", () => {
    const overall = ERA5_SCORECARD_ROWS.find((r) => r.area === "Overall");
    expect(overall?.era4End).toBe(82);
    expect(overall?.era5End).toBe(86);
    expect(overall?.delta).toBe(4);
  });
});
