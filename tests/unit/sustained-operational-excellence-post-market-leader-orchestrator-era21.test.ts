import { describe, expect, it } from "vitest";

import {
  buildSustainedOperationalExcellencePostMarketLeaderOrchestratorSummary,
  buildSustainedOperationalExcellenceReadinessChecklistMarkdown,
  resolveSustainedOperationalExcellenceMilestone,
  resolveSustainedOperationalExcellenceMilestoneFromPhaseStatuses,
} from "@/lib/commercial/sustained-operational-excellence-post-market-leader-orchestrator-era21";
import {
  buildSustainedOperationalExcellencePhaseStatuses,
  resolveSustainedOperationalExcellencePrerequisites,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { evaluateSustainedOperationalExcellenceEnv } from "@/scripts/ops/validate-sustained-operational-excellence-env";

describe("sustained-operational-excellence-post-market-leader-orchestrator-era21", () => {
  it("blocks when market leader is not complete", () => {
    const evaluation = evaluateSustainedOperationalExcellenceEnv({});
    expect(evaluation.sustainedOpsMilestone).toBe("market_leader_blocked");
    expect(evaluation.prerequisites.prerequisitesComplete).toBe(false);
  });

  it("resolves cadence A when market leader complete but sustained ops env empty", () => {
    const prerequisites = resolveSustainedOperationalExcellencePrerequisites({
      goDecision: "GO",
      marketLeaderComplete: true,
    });
    const phases = buildSustainedOperationalExcellencePhaseStatuses({
      prerequisites,
      goNoGoSummary: { decision: "GO", customerName: "Acme" } as never,
      p0Staging: {
        children: { channelLive: { overall: "PASSED" } },
        p0ProofStatus: "proof_passed",
      } as never,
      tier2Summary: { tier2ProofStatus: "proof_passed" } as never,
      metricsBaseline: { overall: "PASSED" } as never,
      competitorMatrix: {
        overall: "PASSED",
        matrixProofStatus: "evidence_aligned_era17",
      } as never,
      env: { SCALE_PER_CUSTOMER_GO_ISOLATION: "1" },
    });
    const milestone = resolveSustainedOperationalExcellenceMilestone({
      prerequisitesComplete: true,
      marketLeaderComplete: true,
      sustainedOpsComplete: false,
      phases,
    });
    expect(milestone).toBe("cadence_a_daily_operational");
  });

  it("builds orchestrator summary with Market leader redirect when blocked", () => {
    const evaluation = evaluateSustainedOperationalExcellenceEnv({});
    const summary = buildSustainedOperationalExcellencePostMarketLeaderOrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        p0StagingPresent: false,
        tier2Present: false,
        metricsBaselinePresent: false,
        competitorMatrixPresent: false,
      },
    });
    expect(summary.milestone).toBe("market_leader_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "market-leader-positioning-post-series-a-orchestrator",
    );
  });

  it("builds readiness checklist markdown", () => {
    const evaluation = evaluateSustainedOperationalExcellenceEnv({});
    const summary = buildSustainedOperationalExcellencePostMarketLeaderOrchestratorSummary({
      evaluation,
      artifacts: {
        goNoGoPresent: true,
        p0StagingPresent: false,
        tier2Present: false,
        metricsBaselinePresent: false,
        competitorMatrixPresent: false,
      },
    });
    const markdown = buildSustainedOperationalExcellenceReadinessChecklistMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain("Sustained Operational Excellence — Readiness Checklist");
    expect(markdown).toContain("sustained-operational-excellence");
  });

  it("resolves milestone from phase statuses for UI", () => {
    const milestone = resolveSustainedOperationalExcellenceMilestoneFromPhaseStatuses(
      [
        { id: "cadence_a_daily_operational", complete: true, optional: false },
        { id: "cadence_b_weekly_integration", complete: false, optional: false },
        { id: "cadence_c_monthly_metrics", complete: false, optional: false },
      ],
      { prerequisitesComplete: true, marketLeaderComplete: true, sustainedOpsComplete: false },
    );
    expect(milestone).toBe("cadence_b_weekly_integration");
  });
});
