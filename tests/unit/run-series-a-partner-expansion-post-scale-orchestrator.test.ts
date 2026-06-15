import { describe, expect, it } from "vitest";

import { runSeriesAPartnerExpansionPostScaleOrchestrator } from "../../scripts/ops/run-series-a-partner-expansion-post-scale-orchestrator";

describe("run-series-a-partner-expansion-post-scale-orchestrator", () => {
  it("runs orchestrator without throwing when skipping template", () => {
    const summary = runSeriesAPartnerExpansionPostScaleOrchestrator({
      writeArtifacts: false,
      skipTemplate: true,
    });
    expect(summary.policyId).toBe("era21-series-a-partner-expansion-post-scale-orchestrator-v1");
    expect(summary.milestone).toBe("scale_blocked");
  });
});
