/**
 * ENT-68 — SLA Monitoring (uptime, response time, alerts).
 *
 * @see services/enterprise/sla-service.ts
 * @see lib/enterprise/sla-monitoring-builders.ts
 */

export const SLA_MONITORING_POLICY_ID = "sla-monitoring-ent68-v1" as const;

export const SLA_MONITORING_PATH = "/dashboard/enterprise/sla" as const;

/** Internal enterprise uptime target — not a contractual SLA until signed addendum. */
export const ENTERPRISE_SLA_UPTIME_TARGET_PCT = 99.9 as const;

/** Database / API health probe response time target (ms). */
export const ENTERPRISE_SLA_RESPONSE_TIME_TARGET_MS = 500 as const;

/** Integration health check P95 target (ms). */
export const ENTERPRISE_SLA_INTEGRATION_P95_TARGET_MS = 800 as const;

/** Max webhook failures per 30d before alert. */
export const ENTERPRISE_SLA_WEBHOOK_FAILURE_ALERT_THRESHOLD = 5 as const;

export const SLA_MONITORING_SIGNALS = [
  "platform_health",
  "integration_fleet",
  "cron_execution",
  "webhook_reliability",
] as const;
