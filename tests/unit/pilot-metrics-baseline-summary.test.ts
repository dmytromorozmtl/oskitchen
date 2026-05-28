import { describe, expect, it } from "vitest";

import {
  buildPilotMetricsBaselineSummary,
  buildPilotMetricSnapshotValues,
  resolvePilotBaselineProofStatus,
} from "@/lib/commercial/pilot-metrics-baseline-summary";

describe("pilot metrics baseline summary", () => {
  it("marks proof skipped when no metrics captured", () => {
    const metrics = buildPilotMetricSnapshotValues({});
    expect(resolvePilotBaselineProofStatus(metrics)).toBe("proof_skipped_missing_pilot_data");
  });

  it("marks proof captured when all metrics present", () => {
    const summary = buildPilotMetricsBaselineSummary({
      ordersPerDay: 12,
      storefrontCheckoutSuccessRate: 95,
      posCheckoutStatus: "PASSED",
      kdsBumpRate: 90,
      supportTicketsPerWeek: 2,
      operatorFeedbackScore: 4.5,
    });
    expect(summary.baselineProofStatus).toBe("proof_captured");
    expect(summary.capturedCount).toBe(6);
  });

  it("marks proof partial when some metrics missing", () => {
    const summary = buildPilotMetricsBaselineSummary({
      ordersPerDay: 10,
      operatorFeedbackScore: 4,
    });
    expect(summary.baselineProofStatus).toBe("proof_partial");
    expect(summary.missingCount).toBeGreaterThan(0);
  });
});
