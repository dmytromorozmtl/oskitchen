import { loadOperationHealth } from "@/services/operations/operation-health-service";

export type AnomalyFlag = { code: string; title: string; detail: string; href: string };

/** Rule-based anomalies only — no synthetic “AI” claims when models are offline. */
export async function detectOperationalAnomalies(userId: string): Promise<AnomalyFlag[]> {
  const { today } = await loadOperationHealth(userId);
  const flags: AnomalyFlag[] = [];
  if (today.kpis.webhooksNeedingAttention > 0) {
    flags.push({
      code: "webhooks_errors",
      title: "Webhook processing issues",
      detail: `${today.kpis.webhooksNeedingAttention} queued webhook(s) have an error or invalid signature.`,
      href: "/dashboard/sales-channels/webhooks",
    });
  } else if (today.kpis.failedWebhooks > 0) {
    flags.push({
      code: "webhooks_pending",
      title: "Webhook backlog",
      detail: `${today.kpis.failedWebhooks} webhook event(s) await processing.`,
      href: "/dashboard/sales-channels/webhooks",
    });
  }
  if (today.kpis.errorIntegrations > 0) {
    flags.push({
      code: "integrations_error",
      title: "Integration errors",
      detail: `${today.kpis.errorIntegrations} connection(s) are in ERROR.`,
      href: "/dashboard/sales-channels/health",
    });
  }
  if (today.kpis.integrityIssueCount > 0) {
    flags.push({
      code: "integrity",
      title: "Data integrity review",
      detail: `${today.kpis.integrityIssueCount} issue(s) flagged by integrity checks.`,
      href: "/dashboard/system-health/data-integrity",
    });
  }
  return flags;
}
