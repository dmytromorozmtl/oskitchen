import { describe, expect, it } from "vitest";

import { evaluateSustainedOperationalExcellenceIntegrity } from "@/lib/commercial/sustained-operational-excellence-integrity-era33";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import { recomputePilotBaselineProofStatusFromSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";

describe("sustained-operational-excellence-integrity-era33", () => {
  it("detects sustained ops started without honest Market leader", () => {
    const result = evaluateSustainedOperationalExcellenceIntegrity(process.cwd(), {
      env: { SUSTAINED_OPS_DAILY_CADENCE_ATTESTED: "1" },
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
    expect(result.sustainedOpsExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "sustained_ops_started_without_market_leader"),
    ).toBe(true);
  });

  it("detects fake metrics PASS for monthly cadence refresh", () => {
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

    const result = evaluateSustainedOperationalExcellenceIntegrity(process.cwd(), {
      env: { SUSTAINED_OPS_MONTHLY_METRICS_REFRESHED: "1" },
      metricsBaselineOverride: metrics,
      goNoGoOverride: null,
    });
    expect(result.violations.some((row) => row.id === "fake_metrics_pass")).toBe(true);
  });
});
