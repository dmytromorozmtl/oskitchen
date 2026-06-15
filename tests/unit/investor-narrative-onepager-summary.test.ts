import { describe, expect, it } from "vitest";

import {
  buildInvestorNarrativeOnepagerSummary,
  resolveInvestorNarrativeProofStatus,
} from "@/lib/commercial/investor-narrative-onepager-summary";

describe("investor narrative onepager summary", () => {
  it("skips when pilot metrics artifact missing", () => {
    const summary = buildInvestorNarrativeOnepagerSummary({
      pilotMetrics: null,
      certPassed: true,
    });
    expect(summary.narrativeProofStatus).toBe("proof_skipped_missing_pilot_metrics");
    expect(summary.overall).toBe("SKIPPED");
  });

  it("skips when pilot metrics overall is not PASSED", () => {
    const summary = buildInvestorNarrativeOnepagerSummary({
      pilotMetrics: {
        overall: "SKIPPED",
        baselineProofStatus: "proof_skipped_missing_pilot_data",
        capturedCount: 0,
      },
      certPassed: true,
    });
    expect(summary.narrativeProofStatus).toBe("proof_skipped_missing_pilot_metrics");
    expect(summary.overall).toBe("SKIPPED");
  });

  it("passes when pilot metrics overall PASSED and cert passed", () => {
    expect(
      resolveInvestorNarrativeProofStatus({
        pilotMetricsArtifactLoaded: true,
        pilotMetricsOverall: "PASSED",
        certPassed: true,
      }),
    ).toBe("proof_ready_with_metrics");
    const summary = buildInvestorNarrativeOnepagerSummary({
      pilotMetrics: {
        overall: "PASSED",
        baselineProofStatus: "proof_captured",
        capturedCount: 6,
      },
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
  });

  it("fails when cert chain fails", () => {
    const summary = buildInvestorNarrativeOnepagerSummary({
      pilotMetrics: {
        overall: "PASSED",
        baselineProofStatus: "proof_captured",
        capturedCount: 6,
      },
      certPassed: false,
    });
    expect(summary.narrativeProofStatus).toBe("proof_failed_cert");
    expect(summary.overall).toBe("FAILED");
  });
});
