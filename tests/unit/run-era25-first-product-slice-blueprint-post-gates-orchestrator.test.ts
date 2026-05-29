import { describe, expect, it } from "vitest";

import { runEra25FirstProductSliceBlueprintPostGatesOrchestrator } from "../../scripts/ops/run-era25-first-product-slice-blueprint-post-gates-orchestrator";

describe("run-era25-first-product-slice-blueprint-post-gates-orchestrator", () => {
  it("returns orchestrator summary without writing artifacts", () => {
    const summary = runEra25FirstProductSliceBlueprintPostGatesOrchestrator();
    expect(summary.policyId).toBe(
      "era24-era25-first-product-slice-blueprint-post-gates-orchestrator-v1",
    );
    expect(summary.milestone).toBe("engineering_gates_blocked");
    expect(summary.blueprintBlocked).toBe(true);
    expect(summary.canonicalSliceName).toBe("owner-daily-briefing-breakthrough");
    expect(summary.recommendedCommands.length).toBeGreaterThan(0);
  });
});
