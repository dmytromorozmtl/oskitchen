import {
  getKdsBumpLatencySloTargets,
  isWithinKdsBumpLatencySlo,
  KDS_BUMP_LATENCY_MAX_SAMPLES,
  type KdsBumpLatencyTargets,
} from "@/lib/kitchen/kds-bump-latency-e2e-policy";
import { percentileMs } from "@/lib/kitchen/kds-realtime-slo-metrics";

export type KdsBumpLatencySnapshot = {
  sampleCount: number;
  p50Ms: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
  targets: KdsBumpLatencyTargets;
  withinSlo: {
    p50: boolean;
    p95: boolean;
    p99: boolean;
  } | null;
};

export function summarizeKdsBumpLatencyMetrics(
  samples: readonly number[],
): KdsBumpLatencySnapshot {
  const targets = getKdsBumpLatencySloTargets();
  const p50Ms = percentileMs(samples, 50);
  const p95Ms = percentileMs(samples, 95);
  const p99Ms = percentileMs(samples, 99);

  const withinSlo =
    p50Ms != null && p95Ms != null && p99Ms != null
      ? {
          p50: isWithinKdsBumpLatencySlo(p50Ms, "p50"),
          p95: isWithinKdsBumpLatencySlo(p95Ms, "p95"),
          p99: isWithinKdsBumpLatencySlo(p99Ms, "p99"),
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

export function recordKdsBumpLatencySample(
  samples: number[],
  latencyMs: number,
  maxSamples: number = KDS_BUMP_LATENCY_MAX_SAMPLES,
): number[] {
  const next = [...samples, Math.max(0, Math.round(latencyMs))];
  if (next.length <= maxSamples) return next;
  return next.slice(next.length - maxSamples);
}

export function bumpLatencyBatchWithinSlo(samples: readonly number[]): boolean {
  const summary = summarizeKdsBumpLatencyMetrics(samples);
  if (!summary.withinSlo) return false;
  return summary.withinSlo.p50 && summary.withinSlo.p95 && summary.withinSlo.p99;
}
