import { WebhookProcessingJobStatus } from "@prisma/client";

/**
 * Canonical lifecycle labels for docs/API. Maps 1:1 to Prisma
 * {@link WebhookProcessingJobStatus} — we keep DB enum names for migration stability.
 */
export type WebhookJobLifecycleLabel =
  | "PENDING"
  | "PROCESSING"
  | "PROCESSED"
  | "FAILED"
  | "RETRYING"
  | "CANCELLED"
  | "IGNORED"
  | "SIGNATURE_FAILED"
  | "UNSUPPORTED";

const MAP: Record<WebhookProcessingJobStatus, WebhookJobLifecycleLabel> = {
  QUEUED: "PENDING",
  PROCESSING: "PROCESSING",
  PROCESSED: "PROCESSED",
  FAILED: "FAILED",
  RETRYING: "RETRYING",
  CANCELLED: "CANCELLED",
  IGNORED: "IGNORED",
  SIGNATURE_FAILED: "SIGNATURE_FAILED",
  UNSUPPORTED: "UNSUPPORTED",
};

export function prismaWebhookJobStatusToLabel(
  s: WebhookProcessingJobStatus,
): WebhookJobLifecycleLabel {
  return MAP[s] ?? "PENDING";
}

export function isWebhookJobTerminal(s: WebhookProcessingJobStatus): boolean {
  return (
    s === WebhookProcessingJobStatus.PROCESSED ||
    s === WebhookProcessingJobStatus.FAILED ||
    s === WebhookProcessingJobStatus.CANCELLED ||
    s === WebhookProcessingJobStatus.IGNORED ||
    s === WebhookProcessingJobStatus.UNSUPPORTED ||
    s === WebhookProcessingJobStatus.SIGNATURE_FAILED
  );
}
