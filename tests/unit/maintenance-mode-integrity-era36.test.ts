import { describe, expect, it } from "vitest";

import { evaluateMaintenanceModeIntegrity } from "@/lib/commercial/maintenance-mode-integrity-era36";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import { recomputePilotBaselineProofStatusFromSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";

describe("maintenance-mode-integrity-era36", () => {
  it("detects maintenance mode started without honest Product evolution", () => {
    const result = evaluateMaintenanceModeIntegrity(process.cwd(), {
      env: { MAINTENANCE_MODE_COMMERCIAL_PILOT_PATH_ATTESTED: "1" },
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
    expect(result.maintenanceModeExecutionStarted).toBe(true);
    expect(
      result.violations.some((row) => row.id === "maintenance_started_without_product_evolution"),
    ).toBe(true);
  });

  it("detects fake rhythm calendar attestation before product evolution honest", () => {
    const result = evaluateMaintenanceModeIntegrity(process.cwd(), {
      env: {
        MAINTENANCE_MODE_COMMERCIAL_PILOT_PATH_ATTESTED: "1",
        MAINTENANCE_MODE_RHYTHM_CALENDAR_REVIEWED: "1",
      },
      goNoGoOverride: null,
    });
    expect(result.violations.some((row) => row.id === "fake_rhythm_calendar_attestation")).toBe(
      true,
    );
  });

  it("detects fake metrics PASS for monthly W1/W2 rhythms", () => {
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

    const result = evaluateMaintenanceModeIntegrity(process.cwd(), {
      env: { MAINTENANCE_MODE_COMMERCIAL_PILOT_PATH_ATTESTED: "1" },
      metricsBaselineOverride: metrics,
      goNoGoOverride: null,
    });
    expect(result.violations.some((row) => row.id === "fake_metrics_pass")).toBe(true);
  });
});
