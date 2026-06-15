import { describe, expect, it } from "vitest";

import {
  buildSustainedOperationalExcellencePhaseStatuses,
  resolveSustainedOperationalExcellenceComplete,
  resolveSustainedOperationalExcellencePrerequisites,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import {
  buildSustainedOperationalExcellenceExecutionGates,
  buildSustainedOperationalExcellenceExecutionSummary,
  resolveSustainedOperationalExcellenceExecutionMilestone,
} from "@/lib/ops/sustained-operational-excellence-execution-orchestrator";

const COMPLETE_CADENCE_ENV: NodeJS.ProcessEnv = {
  SUSTAINED_OPS_DAILY_CADENCE_ATTESTED: "1",
  SUSTAINED_OPS_WEEKLY_INTEGRATION_REVIEWED: "1",
  SUSTAINED_OPS_MONTHLY_METRICS_REFRESHED: "1",
  SUSTAINED_OPS_QUARTERLY_GOVERNANCE_AUDITED: "1",
  SCALE_PER_CUSTOMER_GO_ISOLATION: "1",
  SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED: "1",
};

function buildCompleteCadences(input?: { env?: NodeJS.ProcessEnv; integrationHonest?: boolean }) {
  const prerequisites = resolveSustainedOperationalExcellencePrerequisites({
    goDecision: "GO",
    marketLeaderComplete: true,
  });
  return buildSustainedOperationalExcellencePhaseStatuses({
    prerequisites,
    goNoGoSummary: {
      version: "era17-pilot-gono-go-v1",
      policyId: "era17-pilot-gono-go-v1",
      runAt: "2026-05-29T00:00:00.000Z",
      decision: "GO",
      customerName: "Test Operator",
      blockers: [],
      overall: "PASSED",
      goProofStatus: "proof_passed",
      steps: [],
    },
    p0Staging:
      input?.integrationHonest !== false
        ? {
            version: "era17-p0-staging-proof-unblock-v1",
            policyId: "era17-p0-staging-proof-unblock-v1",
            runAt: "2026-05-29T00:00:00.000Z",
            p0ProofStatus: "proof_passed",
            overall: "PASSED",
            children: {
              channelLive: { overall: "PASSED", steps: [] },
              stagingWorkflows: { overall: "PASSED", steps: [] },
              enterpriseSso: { overall: "SKIPPED", steps: [] },
            },
            steps: [],
          }
        : null,
    tier2Summary:
      input?.integrationHonest === false
        ? null
        : {
            version: "era21-tier2-staging-golden-path-v1",
            policyId: "era21-tier2-staging-golden-path-v1",
            runAt: "2026-05-29T00:00:00.000Z",
            tier2ProofStatus: "proof_passed",
            overall: "PASSED",
            steps: [],
          },
    metricsBaseline: {
      version: "era17-pilot-metrics-baseline-v1",
      policyId: "era17-pilot-metrics-baseline-v1",
      runAt: "2026-05-29T00:00:00.000Z",
      overall: "PASSED",
      metrics: [],
    },
    competitorMatrix: {
      version: "era17-competitor-feature-gap-matrix-v1",
      policyId: "era17-competitor-feature-gap-matrix-v1",
      runAt: "2026-05-29T00:00:00.000Z",
      overall: "PASSED",
      matrixProofStatus: "evidence_aligned_era17",
      steps: [],
    },
    env: input?.env ?? COMPLETE_CADENCE_ENV,
  });
}

describe("sustained-operational-excellence-execution-orchestrator", () => {
  it("resolves market_leader_positioning_blocked before cadences", () => {
    const cadences = buildCompleteCadences();
    expect(
      resolveSustainedOperationalExcellenceExecutionMilestone({
        marketLeaderPositioningPassed: false,
        cadences,
        sustainedOpsIntegrityPassed: true,
      }),
    ).toBe("market_leader_positioning_blocked");
  });

  it("resolves awaiting_cadence_a when market leader passed but cadences incomplete", () => {
    const cadences = buildCompleteCadences({
      env: { ...COMPLETE_CADENCE_ENV, SUSTAINED_OPS_DAILY_CADENCE_ATTESTED: undefined },
    });
    expect(
      resolveSustainedOperationalExcellenceExecutionMilestone({
        marketLeaderPositioningPassed: true,
        cadences,
        sustainedOpsIntegrityPassed: true,
      }),
    ).toBe("awaiting_cadence_a_daily_operational");
  });

  it("resolves sustained_operational_excellence_passed when cadences and integrity pass", () => {
    const cadences = buildCompleteCadences();
    expect(
      resolveSustainedOperationalExcellenceExecutionMilestone({
        marketLeaderPositioningPassed: true,
        cadences,
        sustainedOpsIntegrityPassed: true,
      }),
    ).toBe("sustained_operational_excellence_passed");
  });

  it("never reports sustained_operational_excellence_passed when market leader blocked", () => {
    const summary = buildSustainedOperationalExcellenceExecutionSummary({
      marketLeaderExecution: {
        version: "market-leader-positioning-execution-v1",
        policyId: "era37-market-leader-positioning-execution-v1",
        generatedAt: "2026-05-29T00:00:00.000Z",
        milestone: "series_a_expansion_blocked",
        seriesAExpansionMilestone: "production_ga_blocked",
        goDecision: "NO-GO",
        customerName: null,
        pillarsComplete: false,
        seriesAComplete: false,
        marketLeaderIntegrityPassed: false,
        commercialInflectionMilestone: "p0_ops_vault_blocked",
        pilotExecutableScore: 24,
        phases: [],
        gates: [],
        nextPhase: null,
        recommendedCommands: [],
        productSurfaces: [],
        honestyNote: "test",
      },
    });
    expect(summary.milestone).toBe("market_leader_positioning_blocked");
    expect(summary.milestone).not.toBe("sustained_operational_excellence_passed");
  });

  it("builds nine execution gates", () => {
    const gates = buildSustainedOperationalExcellenceExecutionGates({
      marketLeaderPositioningPassed: false,
      marketLeaderExecutionMilestone: "series_a_expansion_blocked",
      cadencesComplete: false,
      marketLeaderComplete: false,
      sustainedOpsIntegrityPassed: true,
      commercialInflectionMilestone: "p0_ops_vault_blocked",
      goDecision: "NO-GO",
      perCustomerIsolation: false,
      integrationHonest: false,
      metricsBaselinePassed: false,
      competitorAligned: false,
      claimsReviewed: false,
    });
    expect(gates).toHaveLength(9);
    expect(gates.find((g) => g.id === "market_leader_positioning")?.complete).toBe(false);
  });

  it("cadence completion requires blocking cadences only", () => {
    const incomplete = buildCompleteCadences({
      env: { ...COMPLETE_CADENCE_ENV, SUSTAINED_OPS_WEEKLY_INTEGRATION_REVIEWED: undefined },
    });
    expect(resolveSustainedOperationalExcellenceComplete(incomplete)).toBe(false);
    const complete = buildCompleteCadences();
    expect(resolveSustainedOperationalExcellenceComplete(complete)).toBe(true);
  });
});
