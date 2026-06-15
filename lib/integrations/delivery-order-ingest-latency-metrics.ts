/**
 * Delivery order ingest latency metrics for QA-34 E2E contract proof.
 */

import {
  DELIVERY_ORDER_INGEST_MAX_SAMPLES,
  getDeliveryOrderIngestLatencySloTargets,
  isWithinDeliveryOrderIngestLatencySlo,
  type DeliveryOrderIngestLatencyTargets,
} from "@/lib/integrations/delivery-order-ingest-latency-e2e-policy";
import { percentileMs } from "@/lib/kitchen/kds-realtime-slo-metrics";

export type DeliveryOrderIngestLatencySnapshot = {
  sampleCount: number;
  p50Ms: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
  targets: DeliveryOrderIngestLatencyTargets;
  withinSlo: {
    p50: boolean;
    p95: boolean;
    p99: boolean;
  } | null;
};

export function summarizeDeliveryOrderIngestLatencyMetrics(
  samples: readonly number[],
): DeliveryOrderIngestLatencySnapshot {
  const targets = getDeliveryOrderIngestLatencySloTargets();
  const p50Ms = percentileMs(samples, 50);
  const p95Ms = percentileMs(samples, 95);
  const p99Ms = percentileMs(samples, 99);

  const withinSlo =
    p50Ms != null && p95Ms != null && p99Ms != null
      ? {
          p50: isWithinDeliveryOrderIngestLatencySlo(p50Ms, "p50"),
          p95: isWithinDeliveryOrderIngestLatencySlo(p95Ms, "p95"),
          p99: isWithinDeliveryOrderIngestLatencySlo(p99Ms, "p99"),
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

export function recordDeliveryOrderIngestLatencySample(
  samples: number[],
  latencyMs: number,
  maxSamples: number = DELIVERY_ORDER_INGEST_MAX_SAMPLES,
): number[] {
  const next = [...samples, Math.max(0, Math.round(latencyMs))];
  if (next.length <= maxSamples) return next;
  return next.slice(next.length - maxSamples);
}

export function deliveryIngestLatencyBatchWithinSlo(samples: readonly number[]): boolean {
  const summary = summarizeDeliveryOrderIngestLatencyMetrics(samples);
  if (!summary.withinSlo) return false;
  return summary.withinSlo.p50 && summary.withinSlo.p95 && summary.withinSlo.p99;
}

export async function measureAsyncDeliveryIngestLatency(
  operation: () => Promise<unknown>,
): Promise<number> {
  const started = performance.now();
  await operation();
  return performance.now() - started;
}

export function measureSyncDeliveryIngestLatency(operation: () => unknown): number {
  const started = performance.now();
  operation();
  return performance.now() - started;
}
