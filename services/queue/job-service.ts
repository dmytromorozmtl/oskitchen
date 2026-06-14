/**
 * Generic background job helpers will consolidate `ImportJob`, `ExportJob`,
 * `ChannelSyncJob`, and `WebhookProcessingJob` over time. Today, import/export
 * already persist job rows — see `docs/BACKGROUND_IMPORT_EXPORT_JOBS.md`.
 */
export type JobFamily = "WEBHOOK" | "IMPORT" | "EXPORT" | "CHANNEL_SYNC";

export function jobFamilyLabel(f: JobFamily): string {
  switch (f) {
    case "WEBHOOK":
      return "Webhook processing";
    case "IMPORT":
      return "Import";
    case "EXPORT":
      return "Export";
    case "CHANNEL_SYNC":
      return "Channel sync";
    default:
      return f;
  }
}
