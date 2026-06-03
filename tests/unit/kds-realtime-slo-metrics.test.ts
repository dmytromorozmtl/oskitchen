import { describe, expect, it } from "vitest";

import {
  percentileMs,
  recordKdsRealtimeLatencySample,
  summarizeKdsRealtimeSloMetrics,
} from "@/lib/kitchen/kds-realtime-slo-metrics";
import {
  KDS_SLO_REALTIME_P50_MS,
  KDS_SLO_REALTIME_P95_MS,
  KDS_SLO_REALTIME_P99_MS,
} from "@/lib/kitchen/kds-slo-proof-policy";

describe("kds realtime SLO metrics", () => {
  it("computes p50/p95/p99 from samples", () => {
    const samples = Array.from({ length: 100 }, (_, i) => i + 1);
    const summary = summarizeKdsRealtimeSloMetrics(samples);

    expect(summary.p50Ms).toBe(percentileMs(samples, 50));
    expect(summary.p95Ms).toBe(percentileMs(samples, 95));
    expect(summary.p99Ms).toBe(percentileMs(samples, 99));
    expect(summary.targets.p50Ms).toBe(KDS_SLO_REALTIME_P50_MS);
    expect(summary.targets.p95Ms).toBe(KDS_SLO_REALTIME_P95_MS);
    expect(summary.targets.p99Ms).toBe(KDS_SLO_REALTIME_P99_MS);
  });

  it("flags withinSlo when percentiles meet policy targets", () => {
    const summary = summarizeKdsRealtimeSloMetrics([10, 20, 30, 40, 50]);
    expect(summary.withinSlo).toEqual({ p50: true, p95: true, p99: true });
  });

  it("caps rolling sample window", () => {
    let samples: number[] = [];
    for (let i = 0; i < 250; i += 1) {
      samples = recordKdsRealtimeLatencySample(samples, i, 200);
    }
    expect(samples).toHaveLength(200);
    expect(samples[0]).toBe(50);
    expect(samples.at(-1)).toBe(249);
  });
});
