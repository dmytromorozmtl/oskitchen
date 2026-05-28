import { describe, expect, it } from "vitest";

import { runPilotWeek1ExecutionPostGoOrchestrator } from "../../scripts/ops/run-pilot-week1-execution-post-go-orchestrator";

describe("run-pilot-week1-execution-post-go-orchestrator", () => {
  it("runs orchestrator without throwing when skipping template", () => {
    const summary = runPilotWeek1ExecutionPostGoOrchestrator({
      writeArtifacts: false,
      skipTemplate: true,
    });
    expect(summary.policyId).toBe("era21-pilot-week1-execution-post-go-orchestrator-v1");
    expect(summary.milestone).toBe("go_blocked");
  });
});
