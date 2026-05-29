import { describe, expect, it } from "vitest";

import { runMaintenanceModePostProductEvolutionOrchestrator } from "../../scripts/ops/run-maintenance-mode-post-product-evolution-orchestrator";

describe("run-maintenance-mode-post-product-evolution-orchestrator", () => {
  it("runs orchestrator without throwing", () => {
    const summary = runMaintenanceModePostProductEvolutionOrchestrator({
      writeArtifacts: false,
    });
    expect(summary.policyId).toBe(
      "era24-maintenance-mode-post-product-evolution-orchestrator-v1",
    );
    expect(summary.milestone).toBe("product_evolution_blocked");
  });
});
