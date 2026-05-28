import type { ObservabilitySeverity } from "@/lib/observability/severity";
import type { ObservabilityErrorEvent } from "@/services/observability/error-event-service";

export type PlatformErrorRecoverySnapshot = {
  webhookPending: number;
  integrationErrors: number;
  automationFailures: number;
  openTickets: number;
  criticalTickets: number;
  activeIncidents: number;
  criticalProductionIncidents: number;
};

export type ErrorRecoverySnapshot = {
  failedWebhooks: number;
  errorIntegrations: number;
  failedExternalOrders: number;
  failedImports: number;
  unmappedProducts: number;
  cronOpenIncidents: number;
  cronStalledEscalations: number;
  productionIncidentsOpen: number;
  productionIncidentsCritical: number;
};

export type ErrorRecoveryAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type ErrorRecoveryEventNextAction = {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: "urgent" | "normal";
};

const SEVERITY_RANK: Record<ObservabilitySeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

function severityTone(severity: ObservabilitySeverity): "urgent" | "normal" {
  return severity === "critical" || severity === "high" ? "urgent" : "normal";
}

export function summarizeErrorRecoverySnapshot(
  snapshot: ErrorRecoverySnapshot,
): { totalSignals: number; hasUrgent: boolean } {
  const totalSignals =
    snapshot.failedWebhooks +
    snapshot.errorIntegrations +
    snapshot.failedExternalOrders +
    snapshot.failedImports +
    snapshot.unmappedProducts +
    snapshot.cronOpenIncidents +
    snapshot.productionIncidentsOpen;

  const hasUrgent =
    snapshot.productionIncidentsCritical > 0 ||
    snapshot.cronStalledEscalations > 0 ||
    snapshot.errorIntegrations > 0 ||
    snapshot.failedExternalOrders > 0;

  return { totalSignals, hasUrgent };
}

/** Workspace-level failure categories — ordered by operational impact. */
export function pickErrorRecoveryAttentionItems(
  snapshot: ErrorRecoverySnapshot,
): ErrorRecoveryAttentionItem[] {
  const items: ErrorRecoveryAttentionItem[] = [];

  if (snapshot.productionIncidentsCritical > 0) {
    items.push({
      id: "production-critical",
      title: `${snapshot.productionIncidentsCritical} critical production incident${snapshot.productionIncidentsCritical === 1 ? "" : "s"}`,
      detail: "Cross-module failures affecting live service — triage and acknowledge first.",
      href: "/dashboard/system-health/incidents",
      priority: 1,
      tone: "urgent",
    });
  } else if (snapshot.productionIncidentsOpen > 0) {
    items.push({
      id: "production-open",
      title: `${snapshot.productionIncidentsOpen} open production incident${snapshot.productionIncidentsOpen === 1 ? "" : "s"}`,
      detail: "Unified queue across cron, webhooks, and startup readiness.",
      href: "/dashboard/system-health/incidents",
      priority: 2,
      tone: "normal",
    });
  }

  if (snapshot.cronOpenIncidents > 0) {
    items.push({
      id: "cron-attention",
      title: `${snapshot.cronOpenIncidents} cron incident${snapshot.cronOpenIncidents === 1 ? "" : "s"} need attention`,
      detail:
        snapshot.cronStalledEscalations > 0
          ? `${snapshot.cronStalledEscalations} stalled escalation${snapshot.cronStalledEscalations === 1 ? "" : "s"} — review before the next service window.`
          : "Stale or failing scheduled jobs without operator acknowledgment.",
      href: "/dashboard/system-health/cron-execution",
      priority: 3,
      tone: snapshot.cronStalledEscalations > 0 ? "urgent" : "normal",
    });
  }

  if (snapshot.errorIntegrations > 0) {
    items.push({
      id: "integration-errors",
      title: `${snapshot.errorIntegrations} integration error${snapshot.errorIntegrations === 1 ? "" : "s"}`,
      detail: "OAuth, scopes, or remote API failures block channel sync.",
      href: "/dashboard/sales-channels/health",
      priority: 4,
      tone: "urgent",
    });
  }

  if (snapshot.failedExternalOrders > 0) {
    items.push({
      id: "failed-channel-orders",
      title: `${snapshot.failedExternalOrders} failed channel order${snapshot.failedExternalOrders === 1 ? "" : "s"}`,
      detail: "Rows that never became KitchenOS orders — recover from order hub.",
      href: "/dashboard/order-hub?tab=failed",
      priority: 5,
      tone: "urgent",
    });
  }

  if (snapshot.failedImports > 0) {
    items.push({
      id: "failed-imports",
      title: `${snapshot.failedImports} failed import job${snapshot.failedImports === 1 ? "" : "s"}`,
      detail: "CSV or connector uploads need row fixes before retry.",
      href: "/dashboard/import-center/history",
      priority: 6,
      tone: "normal",
    });
  }

  if (snapshot.unmappedProducts > 0) {
    items.push({
      id: "unmapped-catalog",
      title: `${snapshot.unmappedProducts} unmapped catalog row${snapshot.unmappedProducts === 1 ? "" : "s"}`,
      detail: "External SKUs without menu linkage — blocks clean channel imports.",
      href: "/dashboard/product-mapping",
      priority: 7,
      tone: "normal",
    });
  }

  if (snapshot.failedWebhooks > 0) {
    items.push({
      id: "webhook-backlog",
      title: `${snapshot.failedWebhooks} unprocessed webhook${snapshot.failedWebhooks === 1 ? "" : "s"}`,
      detail: "May include normal backlog — inspect processing errors in webhooks separately.",
      href: "/dashboard/sales-channels/webhooks",
      priority: 8,
      tone: "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

/** Recent observability events with safe retry links — newest high-severity first. */
export function pickErrorRecoveryEventNextActions(
  events: readonly ObservabilityErrorEvent[],
  limit = 5,
): ErrorRecoveryEventNextAction[] {
  const sorted = [...events].sort((left, right) => {
    const severityDelta = SEVERITY_RANK[left.severity] - SEVERITY_RANK[right.severity];
    if (severityDelta !== 0) return severityDelta;
    return right.lastSeen.getTime() - left.lastSeen.getTime();
  });

  return sorted.slice(0, limit).map((event) => ({
    id: event.id,
    title: event.summary,
    detail: event.nextRecommendedAction,
    href: event.safeRetryHref ?? "/dashboard/error-recovery",
    tone: severityTone(event.severity),
  }));
}

export function summarizePlatformErrorRecoverySnapshot(
  snapshot: PlatformErrorRecoverySnapshot,
): { totalSignals: number; hasUrgent: boolean } {
  const totalSignals =
    snapshot.webhookPending +
    snapshot.integrationErrors +
    snapshot.automationFailures +
    snapshot.openTickets +
    snapshot.activeIncidents;

  const hasUrgent =
    snapshot.criticalProductionIncidents > 0 ||
    snapshot.criticalTickets > 0 ||
    snapshot.integrationErrors > 0;

  return { totalSignals, hasUrgent };
}

/** Cross-tenant failure categories — ordered by customer and production impact. */
export function pickPlatformErrorRecoveryAttentionItems(
  snapshot: PlatformErrorRecoverySnapshot,
): ErrorRecoveryAttentionItem[] {
  const items: ErrorRecoveryAttentionItem[] = [];

  if (snapshot.criticalProductionIncidents > 0) {
    items.push({
      id: "production-critical",
      title: `${snapshot.criticalProductionIncidents} critical production incident${snapshot.criticalProductionIncidents === 1 ? "" : "s"}`,
      detail: "Cross-tenant failures affecting live service — triage in the incident hub first.",
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
      detail: "Customer-visible escalations — respond before channel recovery work.",
      href: "/platform/support/escalations",
      priority: 3,
      tone: "urgent",
    });
  } else if (snapshot.openTickets > 0) {
    items.push({
      id: "open-tickets",
      title: `${snapshot.openTickets} open support ticket${snapshot.openTickets === 1 ? "" : "s"}`,
      detail: "Customer issues that may block pilot confidence or onboarding.",
      href: "/platform/support",
      priority: 4,
      tone: "normal",
    });
  }

  if (snapshot.integrationErrors > 0) {
    items.push({
      id: "integration-errors",
      title: `${snapshot.integrationErrors} integration error${snapshot.integrationErrors === 1 ? "" : "s"}`,
      detail: "OAuth, token, or remote API failures across tenants.",
      href: "/platform/integrations",
      priority: 5,
      tone: "urgent",
    });
  }

  if (snapshot.webhookPending > 0) {
    items.push({
      id: "webhook-backlog",
      title: `${snapshot.webhookPending} unprocessed webhook${snapshot.webhookPending === 1 ? "" : "s"}`,
      detail: "Cross-tenant backlog — inspect signing and dead-letter patterns.",
      href: "/platform/webhooks",
      priority: 6,
      tone: "normal",
    });
  }

  if (snapshot.automationFailures > 0) {
    items.push({
      id: "automation-failures",
      title: `${snapshot.automationFailures} automation failure${snapshot.automationFailures === 1 ? "" : "s"}`,
      detail: "Failed playbook or automation executions needing review.",
      href: "/platform/automations",
      priority: 7,
      tone: "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

/** Platform observability events — workspace label prefix for cross-tenant triage. */
export function pickPlatformErrorRecoveryEventNextActions(
  events: readonly ObservabilityErrorEvent[],
  limit = 5,
): ErrorRecoveryEventNextAction[] {
  const sorted = [...events].sort((left, right) => {
    const severityDelta = SEVERITY_RANK[left.severity] - SEVERITY_RANK[right.severity];
    if (severityDelta !== 0) return severityDelta;
    return right.lastSeen.getTime() - left.lastSeen.getTime();
  });

  return sorted.slice(0, limit).map((event) => ({
    id: event.id,
    title: event.workspaceLabel ? `[${event.workspaceLabel}] ${event.summary}` : event.summary,
    detail: event.nextRecommendedAction,
    href: event.safeRetryHref ?? "/platform/error-recovery",
    tone: severityTone(event.severity),
  }));
}
