import { describe, expect, it } from "vitest";

import {
  ERA7_COMPLETED_CYCLES,
  ERA7_REAUDIT_DECISION,
  ERA7_SCORECARD_POLICY_ID,
  ERA7_SCORECARD_ROWS,
} from "@/lib/governance/era7-scorecard-policy";

describe("era7 scorecard policy", () => {
  it("locks era7 scorecard refresh policy", () => {
    expect(ERA7_SCORECARD_POLICY_ID).toBe("era7-scorecard-refresh-v1");
    expect(ERA7_COMPLETED_CYCLES).toHaveLength(4);
    expect(ERA7_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
  });

  it("targets 92 overall from era6 baseline 90", () => {
    const overall = ERA7_SCORECARD_ROWS.find((r) => r.area === "Overall");
    expect(overall?.era6End).toBe(90);
    expect(overall?.era7End).toBe(92);
    expect(overall?.delta).toBe(2);
  });
});
