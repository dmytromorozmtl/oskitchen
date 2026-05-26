import type { WebhookEvent } from "@prisma/client";
import type { WebhookProcessingJob, WebhookProcessingJobStatus } from "@prisma/client";

/**
 * Normalized lifecycle for UI + platform tools. Maps DB primitives without inventing
 * provider-specific semantics beyond what we persist.
 */
export type WebhookLifecycleUi =
  | "RECEIVED"
  | "VERIFIED"
  | "SIGNATURE_FAILED"
  | "QUEUED"
  | "PROCESSING"
  | "PROCESSED"
  | "RETRYING"
  | "FAILED"
  | "IGNORED"
  | "UNSUPPORTED";

export function deriveWebhookLifecycleUi(
  event: Pick<WebhookEvent, "signatureValid" | "processed" | "processingError">,
  job?: Pick<WebhookProcessingJob, "status"> | null,
): WebhookLifecycleUi {
  if (!event.signatureValid) return "SIGNATURE_FAILED";
  if (job) {
    switch (job.status as WebhookProcessingJobStatus) {
      case "QUEUED":
        return "QUEUED";
      case "PROCESSING":
        return "PROCESSING";
      case "PROCESSED":
        return "PROCESSED";
      case "FAILED":
      case "CANCELLED":
        return "FAILED";
      case "RETRYING":
        return "RETRYING";
      case "SIGNATURE_FAILED":
        return "SIGNATURE_FAILED";
      case "IGNORED":
        return "IGNORED";
      case "UNSUPPORTED":
        return "UNSUPPORTED";
      default:
        return "QUEUED";
    }
  }
  if (event.processed) return event.processingError ? "FAILED" : "PROCESSED";
  return "VERIFIED";
}
