import { describe, expect, it } from "vitest";

import {
  ERA17_BLENDED_OVERALL,
  ERA17_COMPLETED_CYCLES,
  ERA17_NEXT_ERA_DECISION,
  ERA17_REAUDIT_DECISION,
  ERA17_SCORECARD_POLICY_ID,
  ERA17_SCORECARD_ROWS,
  ERA17_SUCCESS_CRITERIA,
  ERA17_SMOKE_SCRIPTS,
} from "@/lib/governance/era17-scorecard-policy";

describe("era17 scorecard policy", () => {
  it("locks era17 scorecard refresh policy", () => {
    expect(ERA17_SCORECARD_POLICY_ID).toBe("era17-scorecard-refresh-v1");
    expect(ERA17_COMPLETED_CYCLES).toHaveLength(12);
    expect(ERA17_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(ERA17_NEXT_ERA_DECISION.recommendEra18Handoff).toBe(true);
    expect(ERA17_SMOKE_SCRIPTS).toHaveLength(8);
  });

  it("sustains 100 governance overall without inflating blended score", () => {
    const overall = ERA17_SCORECARD_ROWS.find((r) => r.area === "Overall");
    expect(overall?.era16End).toBe(100);
    expect(overall?.era17End).toBe(100);
    expect(overall?.delta).toBe(0);
    expect(ERA17_BLENDED_OVERALL.era17End).toBe(89);
    expect(ERA17_BLENDED_OVERALL.delta).toBe(2);
    expect(ERA17_SUCCESS_CRITERIA.allMet).toBe(false);
  });

  it("records modest sub-area gains capped by P0 proof gaps", () => {
    const marketing = ERA17_SCORECARD_ROWS.find((r) => r.area === "Marketing/sales");
    expect(marketing?.delta).toBe(3);
    const integrations = ERA17_SCORECARD_ROWS.find((r) => r.area === "Integrations");
    expect(integrations?.era17End).toBe(63);
    const enterprise = ERA17_SCORECARD_ROWS.find((r) => r.area === "Enterprise readiness");
    expect(enterprise?.era17End).toBe(73);
  });
});
