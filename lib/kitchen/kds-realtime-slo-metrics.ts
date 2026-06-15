import {
  getKdsRealtimeSloTargets,
  isWithinKdsRealtimeSlo,
  type KdsSloPercentileTargets,
} from "@/lib/kitchen/kds-slo-proof-policy";

/** Rolling window cap for in-browser KDS refresh latency samples. */
export const KDS_REALTIME_SLO_MAX_SAMPLES = 200 as const;

export type KdsRealtimeSloSnapshot = {
  sampleCount: number;
  p50Ms: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
  targets: KdsSloPercentileTargets;
  withinSlo: {
    p50: boolean;
    p95: boolean;
    p99: boolean;
  } | null;
};

export function percentileMs(values: readonly number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  const index = Math.max(0, Math.min(sorted.length - 1, rank));
  return Math.round(sorted[index]!);
}

export function summarizeKdsRealtimeSloMetrics(
  samples: readonly number[],
): KdsRealtimeSloSnapshot {
  const targets = getKdsRealtimeSloTargets();
  const p50Ms = percentileMs(samples, 50);
  const p95Ms = percentileMs(samples, 95);
  const p99Ms = percentileMs(samples, 99);

  const withinSlo =
    p50Ms != null && p95Ms != null && p99Ms != null
      ? {
          p50: isWithinKdsRealtimeSlo(p50Ms, "p50"),
          p95: isWithinKdsRealtimeSlo(p95Ms, "p95"),
          p99: isWithinKdsRealtimeSlo(p99Ms, "p99"),
        }
      : null;

  return {
    sampleCount: samples.length,
    p50Ms,
    p95Ms,
    p99Ms,
    targets,
    withinSlo,
  };
}

export function recordKdsRealtimeLatencySample(
  samples: number[],
  latencyMs: number,
  maxSamples: number = KDS_REALTIME_SLO_MAX_SAMPLES,
): number[] {
  const next = [...samples, Math.max(0, Math.round(latencyMs))];
  if (next.length <= maxSamples) return next;
  return next.slice(next.length - maxSamples);
}
