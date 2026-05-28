import { describe, expect, it } from "vitest";

import {
  ERA14_COMPLETED_CYCLES,
  ERA14_REAUDIT_DECISION,
  ERA14_SCORECARD_POLICY_ID,
  ERA14_SCORECARD_ROWS,
} from "@/lib/governance/era14-scorecard-policy";

describe("era14 scorecard policy", () => {
  it("locks era14 scorecard refresh policy", () => {
    expect(ERA14_SCORECARD_POLICY_ID).toBe("era14-scorecard-refresh-v1");
    expect(ERA14_COMPLETED_CYCLES).toHaveLength(5);
    expect(ERA14_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
  });

  it("sustains 100 overall from era13 baseline with sub-area recert gains", () => {
    const overall = ERA14_SCORECARD_ROWS.find((r) => r.area === "Overall");
    expect(overall?.era13End).toBe(100);
    expect(overall?.era14End).toBe(100);
    expect(overall?.delta).toBe(0);
  });

  it("raises integrations and rbac for era14 recert cycles", () => {
    const integrations = ERA14_SCORECARD_ROWS.find((r) => r.area === "Integrations");
    expect(integrations?.era13End).toBe(59);
    expect(integrations?.era14End).toBe(60);
    const rbac = ERA14_SCORECARD_ROWS.find((r) => r.area === "RBAC");
    expect(rbac?.era14End).toBe(90);
  });
});
