import { describe, expect, it } from "vitest";

import {
  ERA15_COMPLETED_CYCLES,
  ERA15_REAUDIT_DECISION,
  ERA15_SCORECARD_POLICY_ID,
  ERA15_SCORECARD_ROWS,
  ERA15_SMOKE_SCRIPTS,
} from "@/lib/governance/era15-scorecard-policy";

describe("era15 scorecard policy", () => {
  it("locks era15 scorecard refresh policy", () => {
    expect(ERA15_SCORECARD_POLICY_ID).toBe("era15-scorecard-refresh-v1");
    expect(ERA15_COMPLETED_CYCLES).toHaveLength(5);
    expect(ERA15_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(ERA15_SMOKE_SCRIPTS).toHaveLength(5);
  });

  it("sustains 100 overall from era14 with ops recert sub-area gains", () => {
    const overall = ERA15_SCORECARD_ROWS.find((r) => r.area === "Overall");
    expect(overall?.era14End).toBe(100);
    expect(overall?.era15End).toBe(100);
    expect(overall?.delta).toBe(0);
    const devops = ERA15_SCORECARD_ROWS.find((r) => r.area === "DevOps");
    expect(devops?.era15End).toBe(100);
    const kds = ERA15_SCORECARD_ROWS.find((r) => r.area === "KDS");
    expect(kds?.delta).toBe(1);
  });
});
