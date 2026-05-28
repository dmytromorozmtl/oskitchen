import { describe, expect, it } from "vitest";

import {
  ERA12_COMPLETED_CYCLES,
  ERA12_REAUDIT_DECISION,
  ERA12_SCORECARD_POLICY_ID,
  ERA12_SCORECARD_ROWS,
} from "@/lib/governance/era12-scorecard-policy";

describe("era12 scorecard policy", () => {
  it("locks era12 scorecard refresh policy", () => {
    expect(ERA12_SCORECARD_POLICY_ID).toBe("era12-scorecard-refresh-v1");
    expect(ERA12_COMPLETED_CYCLES).toHaveLength(4);
    expect(ERA12_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
  });

  it("targets 99 overall from era11 baseline 98", () => {
    const overall = ERA12_SCORECARD_ROWS.find((r) => r.area === "Overall");
    expect(overall?.era11End).toBe(98);
    expect(overall?.era12End).toBe(99);
    expect(overall?.delta).toBe(1);
  });

  it("raises integrations for golden path recert and smoke policy", () => {
    const integrations = ERA12_SCORECARD_ROWS.find((r) => r.area === "Integrations");
    expect(integrations?.era11End).toBe(58);
    expect(integrations?.era12End).toBe(59);
    expect(integrations?.delta).toBe(1);
  });
});
