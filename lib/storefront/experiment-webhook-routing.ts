/**
 * Per-workspace DLQ webhooks for agency scale.
 * Set `STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL_<WORKSPACE_UUID>` (hyphens → underscores, uppercased).
 * Falls back to `STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL`.
 */
export function resolveEdgeSyncDlqWebhookEnvKey(workspaceId?: string | null): string | undefined {
  const global = process.env.STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL?.trim();
  if (!workspaceId?.trim()) return global;

  const suffix = workspaceId.trim().replace(/-/g, "_").toUpperCase();
  const scoped = process.env[`STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL_${suffix}`]?.trim();
  return scoped || global;
}

export function resolveGa4ParityWebhookEnvKey(workspaceId?: string | null): string | undefined {
  const global =
    process.env.STOREFRONT_GA4_PARITY_WEBHOOK_URL?.trim() ||
    process.env.STOREFRONT_EXPERIMENT_SRM_WEBHOOK_URL?.trim() ||
    process.env.STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL?.trim();

  if (!workspaceId?.trim()) return global;

  const suffix = workspaceId.trim().replace(/-/g, "_").toUpperCase();
  const scoped =
    process.env[`STOREFRONT_GA4_PARITY_WEBHOOK_URL_${suffix}`]?.trim() ||
    process.env[`STOREFRONT_EXPERIMENT_SRM_WEBHOOK_URL_${suffix}`]?.trim();
  return scoped || global;
}

export function resolveSrmWarnWebhookEnvKey(workspaceId?: string | null): string | undefined {
  const global =
    process.env.STOREFRONT_EXPERIMENT_SRM_WEBHOOK_URL?.trim() ||
    process.env.STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL?.trim();

  if (!workspaceId?.trim()) return global;

  const suffix = workspaceId.trim().replace(/-/g, "_").toUpperCase();
  const scoped =
    process.env[`STOREFRONT_EXPERIMENT_SRM_WEBHOOK_URL_${suffix}`]?.trim() ||
    process.env[`STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL_${suffix}`]?.trim();
  return scoped || global;
}
