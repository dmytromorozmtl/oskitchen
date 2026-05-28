import { describe, expect, it } from "vitest";

import {
  ERA13_COMPLETED_CYCLES,
  ERA13_REAUDIT_DECISION,
  ERA13_SCORECARD_POLICY_ID,
  ERA13_SCORECARD_ROWS,
} from "@/lib/governance/era13-scorecard-policy";

describe("era13 scorecard policy", () => {
  it("locks era13 scorecard refresh policy", () => {
    expect(ERA13_SCORECARD_POLICY_ID).toBe("era13-scorecard-refresh-v1");
    expect(ERA13_COMPLETED_CYCLES).toHaveLength(4);
    expect(ERA13_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
  });

  it("targets 100 overall from era12 baseline 99", () => {
    const overall = ERA13_SCORECARD_ROWS.find((r) => r.area === "Overall");
    expect(overall?.era12End).toBe(99);
    expect(overall?.era13End).toBe(100);
    expect(overall?.delta).toBe(1);
  });

  it("raises enterprise readiness for identity recert without delivery claims", () => {
    const enterprise = ERA13_SCORECARD_ROWS.find((r) => r.area === "Enterprise readiness");
    expect(enterprise?.era12End).toBe(65);
    expect(enterprise?.era13End).toBe(66);
    expect(enterprise?.delta).toBe(1);
  });
});
