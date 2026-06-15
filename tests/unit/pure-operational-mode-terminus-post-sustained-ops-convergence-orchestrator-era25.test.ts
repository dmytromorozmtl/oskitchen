import { describe, expect, it } from "vitest";

import type { ContinuousImprovementLoopTrackStatus } from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import {
  buildPureOperationalModeTerminusEra25OrchestratorReportMarkdown,
  buildPureOperationalModeTerminusEra25OrchestratorSummary,
  resolvePureOperationalModeTerminusEra25Milestone,
} from "@/lib/commercial/pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25";
import { evaluatePureOperationalModeTerminusEra25 } from "@/lib/commercial/evaluate-pure-operational-mode-terminus-era25";

const freshTracks = [
  { id: "weekly_integration", label: "Weekly", status: "healthy" },
  { id: "monthly_metrics", label: "Monthly", status: "healthy" },
  { id: "quarterly_governance", label: "Quarterly", status: "healthy" },
] as const satisfies readonly ContinuousImprovementLoopTrackStatus[];

describe("pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25", () => {
  it("blocks when sustained ops convergence is not ready", () => {
    const milestone = resolvePureOperationalModeTerminusEra25Milestone({
      sustainedOperationalExcellenceConvergenceEra25Milestone:
        "market_leader_convergence_regression_blocked",
      sustainedOpsConvergenceReady: false,
      tracks: freshTracks,
    });
    expect(milestone).toBe("sustained_ops_convergence_regression_blocked");
  });

  it("resolves pure_operational_mode_era25_active when sustained ops ready and tracks fresh", () => {
    const milestone = resolvePureOperationalModeTerminusEra25Milestone({
      sustainedOperationalExcellenceConvergenceEra25Milestone:
        "sustained_operational_excellence_convergence_era25_ready",
      sustainedOpsConvergenceReady: true,
      tracks: freshTracks,
    });
    expect(milestone).toBe("pure_operational_mode_era25_active");
  });

  it("resolves attention milestones from overdue tracks", () => {
    const milestone = resolvePureOperationalModeTerminusEra25Milestone({
      sustainedOperationalExcellenceConvergenceEra25Milestone:
        "sustained_operational_excellence_convergence_era25_ready",
      sustainedOpsConvergenceReady: true,
      tracks: [
        { id: "weekly_integration", label: "Weekly integration", status: "overdue" },
        { id: "monthly_metrics", label: "Monthly metrics", status: "healthy" },
        { id: "quarterly_governance", label: "Quarterly governance", status: "healthy" },
      ],
    });
    expect(milestone).toBe("attention_weekly_integration");
  });

  it("builds orchestrator summary with sustained ops redirect when blocked", () => {
    const evaluation = evaluatePureOperationalModeTerminusEra25({});
    const summary = buildPureOperationalModeTerminusEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    expect(summary.milestone).toBe("sustained_ops_convergence_regression_blocked");
    expect(summary.recommendedCommands[0]).toContain("sustained-operational-excellence-convergence");
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluatePureOperationalModeTerminusEra25({});
    const summary = buildPureOperationalModeTerminusEra25OrchestratorSummary({
      evaluation,
      artifacts: { convergenceReportPresent: false },
    });
    const markdown = buildPureOperationalModeTerminusEra25OrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain("era25 Pure Operational Mode Terminus — Orchestrator Report");
    expect(markdown).toContain("#era25-pure-operational-mode-terminus");
  });
});
