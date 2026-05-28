import type { HealthRollup } from "@/lib/observability/status-types";
import {
  pickErrorRecoveryEventNextActions,
  pickPlatformErrorRecoveryEventNextActions,
} from "@/lib/error-recovery/error-recovery-focus-era18";
import type { ObservabilityErrorEvent } from "@/services/observability/error-event-service";

export type PlatformSystemHealthSnapshot = {
  rollup: HealthRollup;
  webhookPending: number;
  integrationErrors: number;
  automationFailures: number;
  openTickets: number;
  criticalTickets: number;
  activeIncidents: number;
  criticalProductionIncidents: number;
  webhookProcessingErrors7d: number;
  openWebhookJobRecoveries: number;
  channelSyncFailed: number;
  notificationFailures7d: number;
};

export type SystemHealthSnapshot = {
  rollup: HealthRollup;
  failedWebhooks: number;
  errorIntegrations: number;
  integrityIssueCount: number;
  openSupportTickets: number;
  unmatchedExternalProducts: number;
  webhookProcessingErrors7d: number;
  openWebhookJobRecoveries: number;
  channelSyncFailed: number;
  notificationFailures7d: number;
  productionIncidentsCritical: number;
  productionIncidentsOpen: number;
  startupReadinessIncidents: number;
};

export type SystemHealthAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type SystemHealthMetricId =
  | "failed-webhooks"
  | "integration-errors"
  | "integrity-flags"
  | "open-support"
  | "unmapped-catalog"
  | "active-orders";

export type PlatformSystemHealthTileId =
  | "webhook-backlog"
  | "integration-errors"
  | "automation-failures"
  | "open-tickets"
  | "critical-tickets"
  | "workspaces";

export type SystemHealthMetricRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

export function summarizeSystemHealthSnapshot(snapshot: SystemHealthSnapshot): {
  totalSignals: number;
  hasUrgent: boolean;
} {
  const totalSignals =
    snapshot.failedWebhooks +
    snapshot.errorIntegrations +
    snapshot.integrityIssueCount +
    snapshot.openSupportTickets +
    snapshot.unmatchedExternalProducts +
    snapshot.webhookProcessingErrors7d +
    snapshot.openWebhookJobRecoveries +
    snapshot.channelSyncFailed +
    snapshot.notificationFailures7d +
    snapshot.productionIncidentsOpen +
    snapshot.startupReadinessIncidents;

  const hasUrgent =
    snapshot.rollup === "CRITICAL" ||
    snapshot.productionIncidentsCritical > 0 ||
    snapshot.startupReadinessIncidents > 0 ||
    snapshot.errorIntegrations > 0 ||
    snapshot.openWebhookJobRecoveries > 0 ||
    snapshot.channelSyncFailed > 0;

  return { totalSignals, hasUrgent };
}

/** Workspace system health categories — integration and production signals first. */
export function pickSystemHealthAttentionItems(
  snapshot: SystemHealthSnapshot,
): SystemHealthAttentionItem[] {
  const items: SystemHealthAttentionItem[] = [];

  if (snapshot.productionIncidentsCritical > 0) {
    items.push({
      id: "production-critical",
      title: `${snapshot.productionIncidentsCritical} critical production incident${snapshot.productionIncidentsCritical === 1 ? "" : "s"}`,
      detail: "Live-service blockers — acknowledge in the incident queue before channel work.",
      href: "/dashboard/system-health/incidents",
      priority: 1,
      tone: "urgent",
    });
  }

  if (snapshot.startupReadinessIncidents > 0) {
    items.push({
      id: "startup-readiness",
      title: `${snapshot.startupReadinessIncidents} startup readiness blocker${snapshot.startupReadinessIncidents === 1 ? "" : "s"}`,
      detail: "Production node would not meet required boot posture — resolve before go-live.",
      href: "/dashboard/system-health/incidents",
      priority: 2,
      tone: "urgent",
    });
  }

  if (snapshot.errorIntegrations > 0) {
    items.push({
      id: "integration-errors",
      title: `${snapshot.errorIntegrations} integration error${snapshot.errorIntegrations === 1 ? "" : "s"}`,
      detail: "Channel connectors need reconnect or scope fixes — check integration health first.",
      href: "/dashboard/sales-channels/health",
      priority: 3,
      tone: "urgent",
    });
  }

  if (snapshot.openWebhookJobRecoveries > 0) {
    items.push({
      id: "webhook-job-recoveries",
      title: `${snapshot.openWebhookJobRecoveries} async webhook job${snapshot.openWebhookJobRecoveries === 1 ? "" : "s"} exhausted retries`,
      detail: "Terminal webhook jobs with open recovery items — inspect before replay.",
      href: "/dashboard/sales-channels/webhooks",
      priority: 4,
      tone: "urgent",
    });
  }

  if (snapshot.channelSyncFailed > 0) {
    items.push({
      id: "channel-sync-failed",
      title: `${snapshot.channelSyncFailed} channel sync failure${snapshot.channelSyncFailed === 1 ? "" : "s"}`,
      detail: "Failed sync jobs block fresh catalog and order imports.",
      href: "/dashboard/sales-channels/health",
      priority: 5,
      tone: "urgent",
    });
  }

  if (snapshot.webhookProcessingErrors7d > 0) {
    items.push({
      id: "webhook-errors-7d",
      title: `${snapshot.webhookProcessingErrors7d} webhook processing error${snapshot.webhookProcessingErrors7d === 1 ? "" : "s"} (7d)`,
      detail: "Signature or handler failures in the last week — review webhook queue.",
      href: "/dashboard/sales-channels/webhooks",
      priority: 6,
      tone: snapshot.webhookProcessingErrors7d >= 5 ? "urgent" : "normal",
    });
  }

  if (snapshot.integrityIssueCount > 0) {
    items.push({
      id: "integrity-flags",
      title: `${snapshot.integrityIssueCount} data integrity flag${snapshot.integrityIssueCount === 1 ? "" : "s"}`,
      detail: "Structural issues like missing prices or empty orders — fix before reporting.",
      href: "/dashboard/system-health/data-integrity",
      priority: 7,
      tone: "normal",
    });
  }

  if (snapshot.unmatchedExternalProducts > 0) {
    items.push({
      id: "unmapped-catalog",
      title: `${snapshot.unmatchedExternalProducts} unmapped catalog row${snapshot.unmatchedExternalProducts === 1 ? "" : "s"}`,
      detail: "External SKUs without menu linkage — blocks clean channel imports.",
      href: "/dashboard/product-mapping",
      priority: 8,
      tone: "normal",
    });
  }

  if (snapshot.notificationFailures7d > 0) {
    items.push({
      id: "notification-failures",
      title: `${snapshot.notificationFailures7d} notification failure${snapshot.notificationFailures7d === 1 ? "" : "s"} (7d)`,
      detail: "Email/SMS delivery issues — check provider config and suppression rules.",
      href: "/dashboard/notifications/retry",
      priority: 9,
      tone: "normal",
    });
  }

  if (snapshot.openSupportTickets > 0 && snapshot.productionIncidentsCritical === 0) {
    items.push({
      id: "open-support",
      title: `${snapshot.openSupportTickets} open support ticket${snapshot.openSupportTickets === 1 ? "" : "s"}`,
      detail: "Customer-visible issues may indicate integration or order workflow friction.",
      href: "/dashboard/support/inbox",
      priority: 10,
      tone: "normal",
    });
  }

  if (snapshot.failedWebhooks > 0) {
    items.push({
      id: "webhook-backlog",
      title: `${snapshot.failedWebhooks} unprocessed webhook${snapshot.failedWebhooks === 1 ? "" : "s"}`,
      detail: "May include normal backlog — compare with processing errors above.",
      href: "/dashboard/sales-channels/webhooks",
      priority: 11,
      tone: "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

/** Health metric tile next action — contextual triage when the signal needs operator action. */
export function resolveSystemHealthMetricRowNextAction(
  metricId: SystemHealthMetricId,
  value: number,
): SystemHealthMetricRowNextAction | null {
  switch (metricId) {
    case "failed-webhooks":
      if (value <= 0) return null;
      return {
        label: "Inspect webhook queue",
        href: "/dashboard/sales-channels/webhooks",
        tone: value >= 10 ? "urgent" : "normal",
      };
    case "integration-errors":
      if (value <= 0) return null;
      return {
        label: "Fix channel connections",
        href: "/dashboard/sales-channels/health",
        tone: "urgent",
      };
    case "integrity-flags":
      if (value <= 0) return null;
      return {
        label: "Review integrity flags",
        href: "/dashboard/system-health/data-integrity",
        tone: "normal",
      };
    case "open-support":
      if (value <= 0) return null;
      return {
        label: "Open support inbox",
        href: "/dashboard/support/inbox",
        tone: "normal",
      };
    case "unmapped-catalog":
      if (value <= 0) return null;
      return {
        label: "Map external SKUs",
        href: "/dashboard/product-mapping",
        tone: "normal",
      };
    case "active-orders":
      return {
        label: "Open order hub",
        href: "/dashboard/orders",
        tone: "normal",
      };
    default:
      return null;
  }
}

/** Platform health tile next action — cross-tenant triage CTA. */
export function resolvePlatformSystemHealthTileRowNextAction(
  tileId: PlatformSystemHealthTileId,
  value: number,
): SystemHealthMetricRowNextAction | null {
  switch (tileId) {
    case "webhook-backlog":
      if (value <= 0) return null;
      return {
        label: "Inspect cross-tenant webhooks",
        href: "/platform/webhooks",
        tone: value >= 25 ? "urgent" : "normal",
      };
    case "integration-errors":
      if (value <= 0) return null;
      return {
        label: "Review platform integrations",
        href: "/platform/integrations",
        tone: "urgent",
      };
    case "automation-failures":
      if (value <= 0) return null;
      return {
        label: "Review automation failures",
        href: "/platform/automations",
        tone: "normal",
      };
    case "open-tickets":
      if (value <= 0) return null;
      return {
        label: "Open support inbox",
        href: "/platform/support",
        tone: "normal",
      };
    case "critical-tickets":
      if (value <= 0) return null;
      return {
        label: "Respond to escalations",
        href: "/platform/support/escalations",
        tone: "urgent",
      };
    case "workspaces":
      return {
        label: "Review workspaces",
        href: "/platform/workspaces",
        tone: "normal",
      };
    default:
      return null;
  }
}

export function pickSystemHealthEventNextActions(
  events: readonly ObservabilityErrorEvent[],
  limit = 5,
) {
  return pickErrorRecoveryEventNextActions(events, limit);
}

export function summarizePlatformSystemHealthSnapshot(
  snapshot: PlatformSystemHealthSnapshot,
): { totalSignals: number; hasUrgent: boolean } {
  const totalSignals =
    snapshot.webhookPending +
    snapshot.integrationErrors +
    snapshot.automationFailures +
    snapshot.openTickets +
    snapshot.activeIncidents +
    snapshot.webhookProcessingErrors7d +
    snapshot.openWebhookJobRecoveries +
    snapshot.channelSyncFailed +
    snapshot.notificationFailures7d;

  const hasUrgent =
    snapshot.rollup === "CRITICAL" ||
    snapshot.criticalProductionIncidents > 0 ||
    snapshot.criticalTickets > 0 ||
    snapshot.integrationErrors > 0 ||
    snapshot.openWebhookJobRecoveries > 0 ||
    snapshot.channelSyncFailed > 0;

  return { totalSignals, hasUrgent };
}

/** Cross-tenant system health categories — production and channel signals first. */
export function pickPlatformSystemHealthAttentionItems(
  snapshot: PlatformSystemHealthSnapshot,
): SystemHealthAttentionItem[] {
  const items: SystemHealthAttentionItem[] = [];

  if (snapshot.criticalProductionIncidents > 0) {
    items.push({
      id: "production-critical",
      title: `${snapshot.criticalProductionIncidents} critical production incident${snapshot.criticalProductionIncidents === 1 ? "" : "s"}`,
      detail: "Cross-tenant live-service blockers — triage in the platform incident hub first.",
      href: "/platform/incidents",
      priority: 1,
      tone: "urgent",
    });
  } else if (snapshot.activeIncidents > 0) {
    items.push({
      id: "production-open",
      title: `${snapshot.activeIncidents} open production incident${snapshot.activeIncidents === 1 ? "" : "s"}`,
      detail: "Unified queue across cron, webhooks, and startup readiness.",
      href: "/platform/incidents",
      priority: 2,
      tone: "normal",
    });
  }

  if (snapshot.criticalTickets > 0) {
    items.push({
      id: "critical-tickets",
      title: `${snapshot.criticalTickets} critical support ticket${snapshot.criticalTickets === 1 ? "" : "s"}`,
      detail: "Customer escalations may indicate cross-tenant integration or order failures.",
      href: "/platform/support/escalations",
      priority: 3,
      tone: "urgent",
    });
  }

  if (snapshot.integrationErrors > 0) {
    items.push({
      id: "integration-errors",
      title: `${snapshot.integrationErrors} integration error${snapshot.integrationErrors === 1 ? "" : "s"}`,
      detail: "OAuth, token, or remote API failures across tenants.",
      href: "/platform/integrations",
      priority: 4,
      tone: "urgent",
    });
  }

  if (snapshot.openWebhookJobRecoveries > 0) {
    items.push({
      id: "webhook-job-recoveries",
      title: `${snapshot.openWebhookJobRecoveries} async webhook job${snapshot.openWebhookJobRecoveries === 1 ? "" : "s"} exhausted retries`,
      detail: "Terminal jobs with open recovery items — inspect tenant webhook health before replay.",
      href: "/platform/webhooks",
      priority: 5,
      tone: "urgent",
    });
  }

  if (snapshot.channelSyncFailed > 0) {
    items.push({
      id: "channel-sync-failed",
      title: `${snapshot.channelSyncFailed} channel sync failure${snapshot.channelSyncFailed === 1 ? "" : "s"}`,
      detail: "Failed sync jobs block catalog and order imports for affected workspaces.",
      href: "/platform/integrations",
      priority: 6,
      tone: "urgent",
    });
  }

  if (snapshot.webhookProcessingErrors7d > 0) {
    items.push({
      id: "webhook-errors-7d",
      title: `${snapshot.webhookProcessingErrors7d} webhook processing error${snapshot.webhookProcessingErrors7d === 1 ? "" : "s"} (7d)`,
      detail: "Signature or handler failures in the last week across all tenants.",
      href: "/platform/webhooks",
      priority: 7,
      tone: snapshot.webhookProcessingErrors7d >= 5 ? "urgent" : "normal",
    });
  }

  if (snapshot.automationFailures > 0) {
    items.push({
      id: "automation-failures",
      title: `${snapshot.automationFailures} automation failure${snapshot.automationFailures === 1 ? "" : "s"}`,
      detail: "Failed playbook or automation executions needing platform review.",
      href: "/platform/automations",
      priority: 8,
      tone: "normal",
    });
  }

  if (snapshot.webhookPending > 0) {
    items.push({
      id: "webhook-backlog",
      title: `${snapshot.webhookPending} unprocessed webhook${snapshot.webhookPending === 1 ? "" : "s"}`,
      detail: "Cross-tenant backlog — compare with processing errors above.",
      href: "/platform/webhooks",
      priority: 9,
      tone: "normal",
    });
  }

  if (snapshot.notificationFailures7d > 0) {
    items.push({
      id: "notification-failures",
      title: `${snapshot.notificationFailures7d} notification failure${snapshot.notificationFailures7d === 1 ? "" : "s"} (7d)`,
      detail: "Delivery failures across tenants — check provider posture per workspace.",
      href: "/platform/notifications",
      priority: 10,
      tone: "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

export function pickPlatformSystemHealthEventNextActions(
  events: readonly ObservabilityErrorEvent[],
  limit = 5,
) {
  return pickPlatformErrorRecoveryEventNextActions(events, limit);
}
