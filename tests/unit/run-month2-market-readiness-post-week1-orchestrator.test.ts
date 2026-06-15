import { describe, expect, it } from "vitest";

import { runMonth2MarketReadinessPostWeek1Orchestrator } from "../../scripts/ops/run-month2-market-readiness-post-week1-orchestrator";

describe("run-month2-market-readiness-post-week1-orchestrator", () => {
  it("runs orchestrator without throwing when skipping template", () => {
    const summary = runMonth2MarketReadinessPostWeek1Orchestrator({
      writeArtifacts: false,
      skipTemplate: true,
    });
    expect(summary.policyId).toBe("era21-month2-market-readiness-post-week1-orchestrator-v1");
    expect(summary.milestone).toBe("week1_blocked");
  });
});
