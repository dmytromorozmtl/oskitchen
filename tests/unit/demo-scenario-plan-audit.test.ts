import { describe, expect, it } from "vitest";

import {
  auditGoldenDemoScenarioPlans,
  summarizeDemoScenarioPlanAudit,
} from "@/services/demo/demo-scenario-audit-service";

describe("auditGoldenDemoScenarioPlans", () => {
  it("has zero FAIL rows for current golden plans", () => {
    const rows = auditGoldenDemoScenarioPlans();
    const s = summarizeDemoScenarioPlanAudit(rows);
    expect(s.failCount).toBe(0);
  });

  it("covers all six golden scenario ids", () => {
    const rows = auditGoldenDemoScenarioPlans();
    expect(rows).toHaveLength(6);
  });
});
