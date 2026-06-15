import { describe, expect, it } from "vitest";

import {
  ERA11_COMPLETED_CYCLES,
  ERA11_REAUDIT_DECISION,
  ERA11_SCORECARD_POLICY_ID,
  ERA11_SCORECARD_ROWS,
} from "@/lib/governance/era11-scorecard-policy";

describe("era11 scorecard policy", () => {
  it("locks era11 scorecard refresh policy", () => {
    expect(ERA11_SCORECARD_POLICY_ID).toBe("era11-scorecard-refresh-v1");
    expect(ERA11_COMPLETED_CYCLES).toHaveLength(4);
    expect(ERA11_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
  });

  it("targets 98 overall from era10 baseline 97", () => {
    const overall = ERA11_SCORECARD_ROWS.find((r) => r.area === "Overall");
    expect(overall?.era10End).toBe(97);
    expect(overall?.era11End).toBe(98);
    expect(overall?.delta).toBe(1);
  });

  it("raises KDS score for staging Playwright path", () => {
    const kds = ERA11_SCORECARD_ROWS.find((r) => r.area === "KDS");
    expect(kds?.era10End).toBe(70);
    expect(kds?.era11End).toBe(72);
    expect(kds?.delta).toBe(2);
  });
});
