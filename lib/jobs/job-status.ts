/** Aligns with persisted job enums across ImportJob, ExportJob, ChannelSyncJob, WebhookProcessingJob. */
export type NormalizedJobStatus =
  | "CREATED"
  | "QUEUED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";
