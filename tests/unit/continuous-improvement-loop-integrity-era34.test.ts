import { describe, expect, it } from "vitest";

import { evaluateContinuousImprovementLoopIntegrity } from "@/lib/commercial/continuous-improvement-loop-integrity-era34";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import { recomputePilotBaselineProofStatusFromSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";

describe("continuous-improvement-loop-integrity-era34", () => {
  it("detects improvement loop started without honest Sustained ops", () => {
    const result = evaluateContinuousImprovementLoopIntegrity(process.cwd(), {
      env: { CONTINUOUS_IMPROVEMENT_LOOP_PURE_MODE_ATTESTED: "1" },
      goNoGoOverride: {
        version: "era17-pilot-gono-go-v1",
        runAt: "2026-05-28T00:00:00.000Z",
        decision: "GO",
        blockers: [],
        warnings: [],
        customerExecutionStatus: "recorded",
        customerName: "Acme",
        loiSignedDate: "2026-06-01",
        prospectExecutionStatus: "none",
        prospectName: null,
        icpQualification: { qualified: true, missingCriteria: [], disqualifiers: [] },
        evidenceGates: [],
        evaluatorInput: {
          tier0Pass: true,
          tier1Pass: true,
          tier2Pass: true,
          tier3Pass: true,
          roleChecklistsComplete: true,
          forbiddenClaimsInContract: false,
          icpQualified: true,
          stagingUrl: "https://x.example.com",
          commitSha: "abc",
        },
      },
      p0ProofStatus: "proof_passed",
      tier2ProofStatus: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.improvementLoopExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "improvement_loop_started_without_sustained_ops"),
    ).toBe(true);
  });

  it("detects fake release cadence attestation before sustained ops honest", () => {
    const result = evaluateContinuousImprovementLoopIntegrity(process.cwd(), {
      env: {
        CONTINUOUS_IMPROVEMENT_LOOP_PURE_MODE_ATTESTED: "1",
        CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CADENCE_REVIEWED: "1",
      },
      goNoGoOverride: null,
    });
    expect(result.violations.some((row) => row.id === "fake_release_cadence_attestation")).toBe(
      true,
    );
  });

  it("detects fake metrics PASS for monthly improvement track", () => {
    const metrics: PilotMetricsBaselineSummary = {
      version: "era17-pilot-metrics-baseline-v1",
      policyId: "era17-pilot-metrics-baseline-v1",
      runAt: "2026-05-28T00:00:00.000Z",
      overall: "PASSED",
      baselineProofStatus: "proof_captured",
      pilotWeek: 8,
      customerRef: "Acme",
      capturedAt: "2026-05-28T00:00:00.000Z",
      metrics: [
        {
          id: "orders_per_day",
          label: "Orders",
          status: "missing",
          value: null,
          unit: "n/a",
        },
      ],
      capturedCount: 0,
      missingCount: 1,
    };
    expect(recomputePilotBaselineProofStatusFromSummary(metrics)).not.toBe("proof_captured");

    const result = evaluateContinuousImprovementLoopIntegrity(process.cwd(), {
      env: { CONTINUOUS_IMPROVEMENT_LOOP_PURE_MODE_ATTESTED: "1" },
      metricsBaselineOverride: metrics,
      goNoGoOverride: null,
    });
    expect(result.violations.some((row) => row.id === "fake_metrics_pass")).toBe(true);
  });
});
