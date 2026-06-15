export const INTEGRATION_HEALTH_SCORING_POLICY_ID =
  "critical-integration-health-scoring-v1" as const;

/** Score bands for GTM and ops dashboards. */
export const INTEGRATION_HEALTH_SCORE_HEALTHY_MIN = 80 as const;
export const INTEGRATION_HEALTH_SCORE_WATCH_MIN = 55 as const;

/** Latency above this (ms) reduces score. */
export const INTEGRATION_HEALTH_LATENCY_WARN_MS = 2_000 as const;

/** Sync older than this (hours) triggers stale alert. */
export const INTEGRATION_HEALTH_SYNC_STALE_HOURS = 24 as const;

/** Webhook failure rate above this triggers predictive alert. */
export const INTEGRATION_HEALTH_WEBHOOK_FAIL_RATE_WARN = 0.15 as const;

export const INTEGRATION_HEALTH_SCORING_DOC = "docs/integration-health-sales-deck.md" as const;

export type IntegrationHealthScoreBand = "healthy" | "watch" | "critical";

export function bandFromScore(score: number): IntegrationHealthScoreBand {
  if (score >= INTEGRATION_HEALTH_SCORE_HEALTHY_MIN) return "healthy";
  if (score >= INTEGRATION_HEALTH_SCORE_WATCH_MIN) return "watch";
  return "critical";
}
