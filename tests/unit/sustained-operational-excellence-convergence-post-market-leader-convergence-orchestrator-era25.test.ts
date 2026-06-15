import { describe, expect, it } from "vitest";

import {
  buildSustainedOperationalExcellenceConvergenceEra25OrchestratorReportMarkdown,
  buildSustainedOperationalExcellenceConvergenceEra25OrchestratorSummary,
  resolveSustainedOperationalExcellenceConvergenceEra25Milestone,
} from "@/lib/commercial/sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25";
import { evaluateSustainedOperationalExcellenceConvergenceEra25 } from "@/lib/commercial/evaluate-sustained-operational-excellence-convergence-era25";

describe("sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25", () => {
  it("blocks when market leader convergence is not ready", () => {
    const milestone = resolveSustainedOperationalExcellenceConvergenceEra25Milestone({
      marketLeaderPositioningConvergenceEra25Milestone: "pillar1_category_narrative",
      sustainedOpsComplete: false,
      phases: [],
    });
    expect(milestone).toBe("market_leader_convergence_regression_blocked");
  });

  it("resolves sustained_operational_excellence_convergence_era25_ready when complete", () => {
    const milestone = resolveSustainedOperationalExcellenceConvergenceEra25Milestone({
      marketLeaderPositioningConvergenceEra25Milestone:
        "market_leader_positioning_convergence_era25_ready",
      sustainedOpsComplete: true,
      phases: [],
    });
    expect(milestone).toBe("sustained_operational_excellence_convergence_era25_ready");
  });

  it("builds orchestrator summary with market leader redirect when blocked", () => {
    const evaluation = evaluateSustainedOperationalExcellenceConvergenceEra25({});
    const summary = buildSustainedOperationalExcellenceConvergenceEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    expect(summary.milestone).toBe("market_leader_convergence_regression_blocked");
    expect(summary.recommendedCommands[0]).toContain("market-leader-positioning-convergence");
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateSustainedOperationalExcellenceConvergenceEra25({});
    const summary = buildSustainedOperationalExcellenceConvergenceEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    const markdown = buildSustainedOperationalExcellenceConvergenceEra25OrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain(
      "era25 Sustained Operational Excellence Convergence — Orchestrator Report",
    );
    expect(markdown).toContain("#era25-sustained-operational-excellence-convergence");
  });
});
