import { describe, expect, it } from "vitest";

import {
  ERA10_COMPLETED_CYCLES,
  ERA10_REAUDIT_DECISION,
  ERA10_SCORECARD_POLICY_ID,
  ERA10_SCORECARD_ROWS,
} from "@/lib/governance/era10-scorecard-policy";

describe("era10 scorecard policy", () => {
  it("locks era10 scorecard refresh policy", () => {
    expect(ERA10_SCORECARD_POLICY_ID).toBe("era10-scorecard-refresh-v1");
    expect(ERA10_COMPLETED_CYCLES).toHaveLength(4);
    expect(ERA10_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
  });

  it("targets 97 overall from era9 baseline 96", () => {
    const overall = ERA10_SCORECARD_ROWS.find((r) => r.area === "Overall");
    expect(overall?.era9End).toBe(96);
    expect(overall?.era10End).toBe(97);
    expect(overall?.delta).toBe(1);
  });

  it("raises KDS score for staging smoke recert", () => {
    const kds = ERA10_SCORECARD_ROWS.find((r) => r.area === "KDS");
    expect(kds?.era9End).toBe(68);
    expect(kds?.era10End).toBe(70);
    expect(kds?.delta).toBe(2);
  });
});
