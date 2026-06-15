export const WEBHOOK_PIPELINE_STATUSES = [
  "processed",
  "pending",
  "retrying",
  "failed",
  "ignored",
] as const;
export type WebhookPipelineStatus = (typeof WEBHOOK_PIPELINE_STATUSES)[number];

export function deriveWebhookPipelineStatus(row: {
  processed: boolean;
  processingError: string | null;
  signatureValid: boolean;
}): WebhookPipelineStatus {
  if (row.processed) return "processed";
  if (row.processingError) return "failed";
  if (!row.signatureValid) return "ignored";
  return "pending";
}
