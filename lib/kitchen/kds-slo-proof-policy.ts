/**
 * KDS Realtime SLO proof targets — Critical Features moat (Cycle 6).
 *
 * These are the **LIVE transport** latency bar for sales proof — tighter than
 * the polling-fallback worst-case bound in `kds-slo-definition.md`.
 *
 * @see docs/kds-slo-proof-plan.md
 */

export const KDS_SLO_PROOF_POLICY_ID = "critical-kds-realtime-slo-proof-v1" as const;

/** SLI: order commit → KDS ticket visible when Realtime is SUBSCRIBED. */
export const KDS_SLO_REALTIME_P50_MS = 500 as const;
export const KDS_SLO_REALTIME_P95_MS = 2_000 as const;
export const KDS_SLO_REALTIME_P99_MS = 5_000 as const;

/** Worst-case bound when Realtime is not SUBSCRIBED (poll fallback). */
export const KDS_SLO_POLLING_FALLBACK_P99_MS = 15_000 as const;

/** Minimum samples required per 7-day proof window. */
export const KDS_SLO_PROOF_MIN_SAMPLES = 100 as const;

/** Rolling window for SLO proof certification. */
export const KDS_SLO_PROOF_WINDOW_DAYS = 7 as const;

/** Fraction of session-minutes Realtime must be SUBSCRIBED during pilot hours. */
export const KDS_SLO_REALTIME_SUBSCRIBED_TARGET_RATIO = 0.95 as const;

export const KDS_SLO_PROOF_DOC = "docs/kds-slo-proof-plan.md" as const;
export const KDS_SLO_SALES_ONE_PAGER_DOC = "docs/kds-sales-one-pager.md" as const;

export const KDS_SLO_PROOF_ARTIFACT = "artifacts/kds-slo-proof-summary.json" as const;

export const KDS_SLO_PROOF_FORBIDDEN_CLAIMS = [
  "sub-500ms guaranteed for all tenants",
  "rush-hour KDS certified",
  "production Realtime SLO met without 7-day histogram",
  "always-on Supabase Realtime",
] as const;

export type KdsSloPercentileTargets = {
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
};

export function getKdsRealtimeSloTargets(): KdsSloPercentileTargets {
  return {
    p50Ms: KDS_SLO_REALTIME_P50_MS,
    p95Ms: KDS_SLO_REALTIME_P95_MS,
    p99Ms: KDS_SLO_REALTIME_P99_MS,
  };
}

export function isWithinKdsRealtimeSlo(
  latencyMs: number,
  percentile: "p50" | "p95" | "p99",
): boolean {
  const targets = getKdsRealtimeSloTargets();
  switch (percentile) {
    case "p50":
      return latencyMs < targets.p50Ms;
    case "p95":
      return latencyMs < targets.p95Ms;
    case "p99":
      return latencyMs < targets.p99Ms;
  }
}
