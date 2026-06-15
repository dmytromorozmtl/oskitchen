import { describe, expect, it } from "vitest";

import {
  resolveEra25PureOperationalModeContext,
  resolveSustainedProductEvolutionPrerequisites,
} from "@/lib/commercial/sustained-product-evolution-phases-era23";
import { resolveSustainedProductEvolutionMilestone } from "@/lib/commercial/sustained-product-evolution-post-improvement-loop-orchestrator-era23";
import { evaluateSustainedProductEvolution } from "@/scripts/ops/validate-sustained-product-evolution";

describe("sustained-product-evolution-era25-integration", () => {
  it("exposes era25 context from terminus validate chain", () => {
    const era25 = resolveEra25PureOperationalModeContext({});
    expect(typeof era25.sustainedOpsConvergenceReady).toBe("boolean");
    expect(typeof era25.pureOperationalModeEra25Active).toBe("boolean");
    expect(era25.platformOpsHref).toContain("#era25-pure-operational-mode-terminus");
  });

  it("orders milestones with era25 sustained ops gate before improvement loop", () => {
    expect(
      resolveSustainedProductEvolutionMilestone({
        productEvolutionReady: false,
        sustainedOpsConvergenceReady: false,
        tracks: [],
      }),
    ).toBe("era25_sustained_ops_convergence_blocked");

    expect(
      resolveSustainedProductEvolutionMilestone({
        productEvolutionReady: false,
        sustainedOpsConvergenceReady: true,
        tracks: [],
      }),
    ).toBe("improvement_loop_blocked");
  });

  it("includes era25 fields in validate JSON evaluation", () => {
    const result = evaluateSustainedProductEvolution({});
    expect(result.prerequisites).toHaveProperty("sustainedOpsConvergenceReady");
    expect(result.prerequisites).toHaveProperty("pureOperationalModeEra25Active");
    expect(result.productEvolutionMilestone).toBe("era25_sustained_ops_convergence_blocked");
  });
});
