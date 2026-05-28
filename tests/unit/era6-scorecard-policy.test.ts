import { describe, expect, it } from "vitest";

import {
  ERA6_COMPLETED_CYCLES,
  ERA6_REAUDIT_DECISION,
  ERA6_SCORECARD_POLICY_ID,
  ERA6_SCORECARD_ROWS,
} from "@/lib/governance/era6-scorecard-policy";

describe("era6 scorecard policy", () => {
  it("locks era6 scorecard refresh policy", () => {
    expect(ERA6_SCORECARD_POLICY_ID).toBe("era6-scorecard-refresh-v1");
    expect(ERA6_COMPLETED_CYCLES).toHaveLength(5);
    expect(ERA6_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
  });

  it("targets 90 overall from era5 baseline 86", () => {
    const overall = ERA6_SCORECARD_ROWS.find((r) => r.area === "Overall");
    expect(overall?.era5End).toBe(86);
    expect(overall?.era6End).toBe(90);
    expect(overall?.delta).toBe(4);
  });
});
