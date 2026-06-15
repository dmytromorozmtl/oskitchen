/**
 * Cross-cutting health signals for workspace dashboards and platform ops views.
 * Values are intentionally coarse — detailed diagnosis stays in owning modules.
 */
export type HealthRollup = "HEALTHY" | "DEGRADED" | "CRITICAL";

export type IntegrationSignalTone = "ok" | "warning" | "error" | "unknown";

export type ModuleHealthTag =
  | "WEBHOOKS"
  | "CHANNEL_SYNC"
  | "NOTIFICATIONS"
  | "IMPORTS"
  | "EXPORTS"
  | "AUTOMATIONS"
  | "AUDIT"
  | "BILLING"
  | "POS"
  | "ROUTING"
  | "UNKNOWN";

export type ObservabilityRollupCounts = {
  webhookQueued: number;
  webhookProcessingErrors7d: number;
  /** Terminal FAILED async webhook jobs with an open ErrorRecoveryItem (WEBHOOK_JOB source). */
  openWebhookJobRecoveries: number;
  channelSyncFailed: number;
  notificationFailures7d: number;
  importJobsFailed: number;
  channelImportBatchesFailed: number;
  exportJobsFailed: number;
  automationExecutionsFailed7d: number;
  auditExportsFailed7d: number;
};

export function rollupFromCounts(c: ObservabilityRollupCounts): HealthRollup {
  const criticalHints =
    c.webhookProcessingErrors7d +
    c.openWebhookJobRecoveries +
    c.channelSyncFailed +
    c.notificationFailures7d +
    c.importJobsFailed +
    c.channelImportBatchesFailed +
    c.exportJobsFailed +
    c.automationExecutionsFailed7d +
    c.auditExportsFailed7d;
  if (criticalHints >= 8 || c.webhookProcessingErrors7d >= 5 || c.openWebhookJobRecoveries >= 3) return "CRITICAL";
  if (criticalHints >= 1 || c.webhookQueued > 25) return "DEGRADED";
  return "HEALTHY";
}
