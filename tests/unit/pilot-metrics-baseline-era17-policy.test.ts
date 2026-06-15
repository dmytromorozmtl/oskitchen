import { describe, expect, it } from "vitest";

import {
  PILOT_METRICS_BASELINE_ERA17_METRIC_DEFINITIONS,
  PILOT_METRICS_BASELINE_ERA17_POLICY_ID,
  PILOT_METRICS_BASELINE_ERA17_PROOF_STATUS,
} from "@/lib/commercial/pilot-metrics-baseline-era17-policy";

describe("pilot metrics baseline era17 policy", () => {
  it("locks era17 pilot metrics baseline policy id", () => {
    expect(PILOT_METRICS_BASELINE_ERA17_POLICY_ID).toBe("era17-pilot-metrics-baseline-v1");
  });

  it("does not claim baseline without pilot data", () => {
    expect(PILOT_METRICS_BASELINE_ERA17_PROOF_STATUS).toBe("awaiting_baseline_capture");
  });

  it("defines six pilot success metrics aligned with ICP contract", () => {
    expect(PILOT_METRICS_BASELINE_ERA17_METRIC_DEFINITIONS).toHaveLength(6);
    expect(PILOT_METRICS_BASELINE_ERA17_METRIC_DEFINITIONS.map((metric) => metric.id)).toContain(
      "orders_per_day",
    );
    expect(PILOT_METRICS_BASELINE_ERA17_METRIC_DEFINITIONS.map((metric) => metric.id)).toContain(
      "operator_feedback_score",
    );
  });
});
