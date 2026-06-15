import { describe, expect, it } from "vitest";

import {
  ERA8_COMPLETED_CYCLES,
  ERA8_REAUDIT_DECISION,
  ERA8_SCORECARD_POLICY_ID,
  ERA8_SCORECARD_ROWS,
} from "@/lib/governance/era8-scorecard-policy";

describe("era8 scorecard policy", () => {
  it("locks era8 scorecard refresh policy", () => {
    expect(ERA8_SCORECARD_POLICY_ID).toBe("era8-scorecard-refresh-v1");
    expect(ERA8_COMPLETED_CYCLES).toHaveLength(4);
    expect(ERA8_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
  });

  it("targets 94 overall from era7 baseline 92", () => {
    const overall = ERA8_SCORECARD_ROWS.find((r) => r.area === "Overall");
    expect(overall?.era7End).toBe(92);
    expect(overall?.era8End).toBe(94);
    expect(overall?.delta).toBe(2);
  });
});
