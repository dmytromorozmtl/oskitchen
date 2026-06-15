import { describe, expect, it } from "vitest";

import { evaluatePilotWeek1ExecutionIntegrity } from "@/lib/commercial/pilot-week1-execution-integrity-era28";
import { recomputePilotBaselineProofStatusFromSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";

describe("pilot-week1-execution-integrity-era28", () => {
  it("detects Week 1 started without honest GO", () => {
    const result = evaluatePilotWeek1ExecutionIntegrity(process.cwd(), {
      env: { PILOT_WEEK1_TTV_HOURS: "4" },
      goNoGoOverride: {
        version: "era17-pilot-gono-go-v1",
        runAt: "2026-05-28T00:00:00.000Z",
        decision: "NO-GO",
        blockers: ["blocked"],
        warnings: [],
        customerExecutionStatus: "skipped_missing_customer",
        customerName: null,
        loiSignedDate: null,
        prospectExecutionStatus: "none",
        prospectName: null,
        icpQualification: { qualified: false, missingCriteria: [], disqualifiers: [] },
        evidenceGates: [],
        evaluatorInput: {
          tier0Pass: false,
          tier1Pass: false,
          tier2Pass: false,
          roleChecklistsComplete: false,
          forbiddenClaimsInContract: false,
        },
      },
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.week1ExecutionStarted).toBe(true);
    expect(result.violations.some((row) => row.id === "week1_started_without_honest_go")).toBe(
      true,
    );
  });

  it("detects fake metrics PASS", () => {
    const metrics: PilotMetricsBaselineSummary = {
      version: "era17-pilot-metrics-baseline-v1",
      policyId: "era17-pilot-metrics-baseline-v1",
      runAt: "2026-05-28T00:00:00.000Z",
      overall: "PASSED",
      baselineProofStatus: "proof_captured",
      pilotWeek: 1,
      customerRef: null,
      capturedAt: null,
      metrics: [
        {
          id: "orders_per_day",
          label: "Orders",
          status: "missing",
          value: null,
          unit: "orders/day",
          reason: "missing",
        },
      ],
      capturedCount: 0,
      missingCount: 1,
    };
    expect(recomputePilotBaselineProofStatusFromSummary(metrics)).toBe(
      "proof_skipped_missing_pilot_data",
    );

    const result = evaluatePilotWeek1ExecutionIntegrity(process.cwd(), {
      metricsBaselineOverride: metrics,
      goNoGoOverride: null,
    });
    expect(result.violations.some((row) => row.id === "fake_metrics_pass")).toBe(true);
  });
});
