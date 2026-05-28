import { describe, expect, it } from "vitest";

import {
  ERA16_COMPLETED_CYCLES,
  ERA16_NEXT_ERA_DECISION,
  ERA16_REAUDIT_DECISION,
  ERA16_SCORECARD_POLICY_ID,
  ERA16_SCORECARD_ROWS,
  ERA16_SMOKE_SCRIPTS,
} from "@/lib/governance/era16-scorecard-policy";

describe("era16 scorecard policy", () => {
  it("locks era16 scorecard refresh policy", () => {
    expect(ERA16_SCORECARD_POLICY_ID).toBe("era16-scorecard-refresh-v1");
    expect(ERA16_COMPLETED_CYCLES).toHaveLength(12);
    expect(ERA16_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(ERA16_NEXT_ERA_DECISION.recommendEra17).toBe(true);
    expect(ERA16_SMOKE_SCRIPTS).toHaveLength(5);
  });

  it("sustains 100 overall from era15 with commercial-proof sub-area gains", () => {
    const overall = ERA16_SCORECARD_ROWS.find((r) => r.area === "Overall");
    expect(overall?.era15End).toBe(100);
    expect(overall?.era16End).toBe(100);
    expect(overall?.delta).toBe(0);
    const enterprise = ERA16_SCORECARD_ROWS.find((r) => r.area === "Enterprise readiness");
    expect(enterprise?.delta).toBe(5);
    const security = ERA16_SCORECARD_ROWS.find((r) => r.area === "Security");
    expect(security?.era16End).toBe(85);
  });
});
