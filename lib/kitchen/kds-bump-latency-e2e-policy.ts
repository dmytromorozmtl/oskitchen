/**
 * KDS bump reflect latency E2E policy (QA-30).
 *
 * SLI-2: bumpDailyKdsOrderAction commit → ticket visible under expo (ready) column.
 *
 * @see e2e/kds-bump-latency.spec.ts
 * @see docs/kds-slo-proof-plan.md SLI-2
 */

export const KDS_BUMP_LATENCY_E2E_POLICY_ID = "kds-bump-latency-e2e-v1" as const;

export const KDS_BUMP_LATENCY_SLI_ID = "kds.bump_reflect_latency_ms" as const;

/** LIVE transport targets from docs/kds-slo-proof-plan.md */
export const KDS_BUMP_LATENCY_P50_MS = 400 as const;
export const KDS_BUMP_LATENCY_P95_MS = 1_500 as const;
export const KDS_BUMP_LATENCY_P99_MS = 4_000 as const;

/** Minimum samples for E2E latency proof batch. */
export const KDS_BUMP_LATENCY_E2E_MIN_SAMPLES = 20 as const;

export const KDS_BUMP_LATENCY_MAX_SAMPLES = 200 as const;

export const KDS_KITCHEN_PATH = "/dashboard/kitchen" as const;
export const KDS_SECTION_READY_TESTID = "kds-section-ready" as const;
export const KDS_BUMP_NEXT_BUTTON_TESTID = "kds-bump-next-button" as const;

export type KdsBumpLatencyTargets = {
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
};

export function getKdsBumpLatencySloTargets(): KdsBumpLatencyTargets {
  return {
    p50Ms: KDS_BUMP_LATENCY_P50_MS,
    p95Ms: KDS_BUMP_LATENCY_P95_MS,
    p99Ms: KDS_BUMP_LATENCY_P99_MS,
  };
}

export function isWithinKdsBumpLatencySlo(
  latencyMs: number,
  percentile: "p50" | "p95" | "p99",
): boolean {
  const targets = getKdsBumpLatencySloTargets();
  switch (percentile) {
    case "p50":
      return latencyMs < targets.p50Ms;
    case "p95":
      return latencyMs < targets.p95Ms;
    case "p99":
      return latencyMs < targets.p99Ms;
  }
}

export function kdsTicketTestId(orderId: string): string {
  return `kds-ticket-${orderId}`;
}

export function kdsTicketNextActionTestId(orderId: string): string {
  return `kds-ticket-next-action-${orderId}`;
}

export function hasEnoughBumpLatencySamples(sampleCount: number): boolean {
  return sampleCount >= KDS_BUMP_LATENCY_E2E_MIN_SAMPLES;
}
