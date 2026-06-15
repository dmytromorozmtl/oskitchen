import {
  ENTERPRISE_SLA_INTEGRATION_P95_TARGET_MS,
  ENTERPRISE_SLA_RESPONSE_TIME_TARGET_MS,
  ENTERPRISE_SLA_UPTIME_TARGET_PCT,
  ENTERPRISE_SLA_WEBHOOK_FAILURE_ALERT_THRESHOLD,
  SLA_MONITORING_PATH,
  SLA_MONITORING_POLICY_ID,
  SLA_MONITORING_SIGNALS,
} from "@/lib/enterprise/sla-monitoring-policy";
import type {
  SlaMonitoringAlert,
  SlaMonitoringDashboard,
  SlaSignalSnapshot,
} from "@/lib/enterprise/sla-monitoring-types";

export type SlaMonitoringBuildInput = {
  workspaceId: string;
  databaseOk: boolean;
  databaseLatencyMs: number;
  integrationFleetScore: number;
  healthyIntegrations: number;
  watchIntegrations: number;
  criticalIntegrations: number;
  monitoredIntegrations: number;
  cronHealthy: number;
  cronTotal: number;
  cronFailing: number;
  failedWebhooks: number;
  integrationCheckLatencyMs: number | null;
  integrationCheckP95Ms: number | null;
  analyzedAt?: Date;
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function computeUptimePct(input: SlaMonitoringBuildInput): number {
  const weights: number[] = [];
  weights.push(input.databaseOk ? 100 : 0);
  if (input.monitoredIntegrations > 0) {
    weights.push((input.healthyIntegrations / input.monitoredIntegrations) * 100);
  }
  if (input.cronTotal > 0) {
    weights.push((input.cronHealthy / input.cronTotal) * 100);
  }
  if (weights.length === 0) return 100;
  return round1(weights.reduce((sum, value) => sum + value, 0) / weights.length);
}

export function buildSlaSignals(input: SlaMonitoringBuildInput): SlaSignalSnapshot[] {
  const uptimePct = computeUptimePct(input);

  const platformStatus: SlaSignalSnapshot["status"] = input.databaseOk
    ? input.databaseLatencyMs <= ENTERPRISE_SLA_RESPONSE_TIME_TARGET_MS
      ? "healthy"
      : "degraded"
    : "down";

  const fleetStatus: SlaSignalSnapshot["status"] =
    input.criticalIntegrations > 0
      ? "down"
      : input.watchIntegrations > 0
        ? "degraded"
        : "healthy";

  const cronStatus: SlaSignalSnapshot["status"] =
    input.cronFailing > 0 ? "degraded" : input.cronTotal === 0 ? "degraded" : "healthy";

  const webhookStatus: SlaSignalSnapshot["status"] =
    input.failedWebhooks >= ENTERPRISE_SLA_WEBHOOK_FAILURE_ALERT_THRESHOLD
      ? "degraded"
      : "healthy";

  return [
    {
      id: "platform_health",
      label: "Platform health",
      status: platformStatus,
      uptimePct: input.databaseOk ? 100 : 0,
      responseTimeMs: input.databaseLatencyMs,
      detail: input.databaseOk
        ? `Database probe ${input.databaseLatencyMs}ms`
        : "Database unreachable",
    },
    {
      id: "integration_fleet",
      label: "LIVE integration fleet",
      status: fleetStatus,
      uptimePct:
        input.monitoredIntegrations > 0
          ? round1((input.healthyIntegrations / input.monitoredIntegrations) * 100)
          : null,
      responseTimeMs: input.integrationCheckLatencyMs,
      detail: `${input.healthyIntegrations}/${input.monitoredIntegrations} healthy · fleet score ${input.integrationFleetScore}`,
    },
    {
      id: "cron_execution",
      label: "Critical cron jobs",
      status: cronStatus,
      uptimePct:
        input.cronTotal > 0 ? round1((input.cronHealthy / input.cronTotal) * 100) : null,
      responseTimeMs: null,
      detail: `${input.cronHealthy}/${input.cronTotal} healthy · ${input.cronFailing} failing`,
    },
    {
      id: "webhook_reliability",
      label: "Webhook reliability",
      status: webhookStatus,
      uptimePct: null,
      responseTimeMs: null,
      detail: `${input.failedWebhooks} failed webhook events in audit window`,
    },
  ];
}

export function buildSlaAlerts(input: SlaMonitoringBuildInput): SlaMonitoringAlert[] {
  const alerts: SlaMonitoringAlert[] = [];
  const uptimePct = computeUptimePct(input);

  if (uptimePct < ENTERPRISE_SLA_UPTIME_TARGET_PCT) {
    alerts.push({
      id: "uptime_breach",
      signal: "platform_health",
      severity: uptimePct < 95 ? "critical" : "warning",
      title: "Uptime below target",
      detail: `${uptimePct}% vs ${ENTERPRISE_SLA_UPTIME_TARGET_PCT}% target`,
      href: "/dashboard/integration-health/live",
    });
  }

  if (input.databaseLatencyMs > ENTERPRISE_SLA_RESPONSE_TIME_TARGET_MS) {
    alerts.push({
      id: "db_latency",
      signal: "platform_health",
      severity: input.databaseLatencyMs > 1000 ? "critical" : "warning",
      title: "Database latency spike",
      detail: `${input.databaseLatencyMs}ms vs ${ENTERPRISE_SLA_RESPONSE_TIME_TARGET_MS}ms target`,
      href: "/api/health",
    });
  }

  if (
    input.integrationCheckP95Ms != null &&
    input.integrationCheckP95Ms > ENTERPRISE_SLA_INTEGRATION_P95_TARGET_MS
  ) {
    alerts.push({
      id: "integration_p95",
      signal: "integration_fleet",
      severity: "warning",
      title: "Integration check P95 elevated",
      detail: `${input.integrationCheckP95Ms}ms vs ${ENTERPRISE_SLA_INTEGRATION_P95_TARGET_MS}ms P95 target`,
      href: "/dashboard/integration-health/live",
    });
  }

  if (input.criticalIntegrations > 0) {
    alerts.push({
      id: "integration_critical",
      signal: "integration_fleet",
      severity: "critical",
      title: "Critical integration health",
      detail: `${input.criticalIntegrations} LIVE integration(s) in critical band`,
      href: "/dashboard/integration-health/live",
    });
  }

  if (input.cronFailing > 0) {
    alerts.push({
      id: "cron_failing",
      signal: "cron_execution",
      severity: "warning",
      title: "Cron execution failures",
      detail: `${input.cronFailing} critical cron job(s) failing or stale`,
      href: "/dashboard/settings/cron",
    });
  }

  if (input.failedWebhooks >= ENTERPRISE_SLA_WEBHOOK_FAILURE_ALERT_THRESHOLD) {
    alerts.push({
      id: "webhook_failures",
      signal: "webhook_reliability",
      severity: "warning",
      title: "Webhook failure threshold",
      detail: `${input.failedWebhooks} failed events — review channel webhooks`,
      href: "/dashboard/audit-logs?tab=integrations",
    });
  }

  return alerts;
}

export function buildSlaMonitoringDashboard(input: SlaMonitoringBuildInput): SlaMonitoringDashboard {
  const signals = buildSlaSignals(input);
  const alerts = buildSlaAlerts(input);
  const uptimePct = computeUptimePct(input);

  const warnings: string[] = [
    "Enterprise SLA targets are internal monitoring thresholds — not a signed contractual SLA.",
  ];
  if (input.monitoredIntegrations === 0) {
    warnings.push("No LIVE integrations monitored — connect channels to populate fleet SLA.");
  }

  return {
    policyId: SLA_MONITORING_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    targets: {
      uptimePct: ENTERPRISE_SLA_UPTIME_TARGET_PCT,
      responseTimeMs: ENTERPRISE_SLA_RESPONSE_TIME_TARGET_MS,
      integrationP95Ms: ENTERPRISE_SLA_INTEGRATION_P95_TARGET_MS,
    },
    summary: {
      uptimePct,
      databaseLatencyMs: input.databaseLatencyMs,
      integrationFleetScore: input.integrationFleetScore,
      healthyIntegrations: input.healthyIntegrations,
      criticalIntegrations: input.criticalIntegrations,
      cronHealthy: input.cronHealthy,
      cronTotal: input.cronTotal,
      failedWebhooks: input.failedWebhooks,
      alertCount: alerts.length,
    },
    signals,
    alerts,
    warnings,
    basePath: SLA_MONITORING_PATH,
  };
}

export function listSlaMonitoringSignalIds(): readonly string[] {
  return SLA_MONITORING_SIGNALS;
}
