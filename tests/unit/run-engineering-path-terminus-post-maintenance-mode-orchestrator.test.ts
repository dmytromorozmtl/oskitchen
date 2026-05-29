import { describe, expect, it } from "vitest";

import { runEngineeringPathTerminusPostMaintenanceModeOrchestrator } from "../../scripts/ops/run-engineering-path-terminus-post-maintenance-mode-orchestrator";

describe("run-engineering-path-terminus-post-maintenance-mode-orchestrator", () => {
  it("runs orchestrator without throwing", () => {
    const summary = runEngineeringPathTerminusPostMaintenanceModeOrchestrator({
      writeArtifacts: false,
    });
    expect(summary.policyId).toBe(
      "era24-engineering-path-terminus-post-maintenance-mode-orchestrator-v1",
    );
    expect(summary.milestone).toBe("maintenance_mode_blocked");
  });
});
