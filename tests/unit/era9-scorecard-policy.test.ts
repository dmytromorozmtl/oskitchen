import { describe, expect, it } from "vitest";

import {
  ERA9_COMPLETED_CYCLES,
  ERA9_REAUDIT_DECISION,
  ERA9_SCORECARD_POLICY_ID,
  ERA9_SCORECARD_ROWS,
} from "@/lib/governance/era9-scorecard-policy";

describe("era9 scorecard policy", () => {
  it("locks era9 scorecard refresh policy", () => {
    expect(ERA9_SCORECARD_POLICY_ID).toBe("era9-scorecard-refresh-v1");
    expect(ERA9_COMPLETED_CYCLES).toHaveLength(4);
    expect(ERA9_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
  });

  it("targets 96 overall from era8 baseline 94", () => {
    const overall = ERA9_SCORECARD_ROWS.find((r) => r.area === "Overall");
    expect(overall?.era8End).toBe(94);
    expect(overall?.era9End).toBe(96);
    expect(overall?.delta).toBe(2);
  });
});
