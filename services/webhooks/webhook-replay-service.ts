import {
  IntegrationProvider,
  WebhookProcessingJobStatus,
} from "@prisma/client";

import { PLATFORM_WEBHOOK_REPLAY_REQUESTED } from "@/lib/audit/platform-integration-audit-actions";
import { isWebhookAsyncQueueEnabled } from "@/lib/webhooks/webhook-queue-mode";
import { getWebhookJobMaxAttempts } from "@/lib/webhooks/webhook-job-config";
import {
  WEBHOOK_REPLAY_REASON_MAX,
  WEBHOOK_REPLAY_REASON_MIN,
} from "@/lib/webhooks/webhook-replay-permissions";
import { isWebhookAsyncSupportedProvider } from "@/lib/webhooks/webhook-provider";
import { markWebhookProcessed } from "@/lib/webhooks/webhook-event-store";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/services/audit/audit-service";
import { buildAuditReasonMetadata } from "@/services/audit/audit-reason-service";
import { executeInboundWebhookByProvider } from "@/services/webhooks/webhook-provider-router";
import { resolveWebhookJobWorkspaceId } from "@/services/webhooks/webhook-ingest-service";
import { captureErrorSafe } from "@/services/observability/error-reporting-service";

export type WebhookReplaySurface = "platform" | "workspace";

export type RequestWebhookReplayInput = {
  webhookEventId: string;
  reason: string;
  actorUserId: string;
  actorEmail: string | null;
  surface: WebhookReplaySurface;
  /** Platform-only escape hatch — still audited; never default true. */
  allowInvalidSignature?: boolean;
};

function normalizeReason(raw: string): string {
  return raw.trim();
}

/**
 * Audited replay: resets processing state and either re-enqueues async work or re-runs inline handlers.
 * Does not mutate stored payload JSON. Idempotency of side effects depends on downstream order/product upserts.
 */
export async function requestWebhookReplay(
  input: RequestWebhookReplayInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const reason = normalizeReason(input.reason);
  if (reason.length < WEBHOOK_REPLAY_REASON_MIN || reason.length > WEBHOOK_REPLAY_REASON_MAX) {
    return {
      ok: false,
      error: `Reason must be between ${WEBHOOK_REPLAY_REASON_MIN} and ${WEBHOOK_REPLAY_REASON_MAX} characters.`,
    };
  }

  const event = await prisma.webhookEvent.findUnique({
    where: { id: input.webhookEventId },
    select: {
      id: true,
      userId: true,
      workspaceId: true,
      provider: true,
      topic: true,
      payloadJson: true,
      signatureValid: true,
      connectionId: true,
    },
  });

  if (!event) {
    return { ok: false, error: "Webhook event not found." };
  }

  if (!event.connectionId) {
    return { ok: false, error: "Cannot replay — event has no integration connection." };
  }

  if (!event.signatureValid && !input.allowInvalidSignature) {
    return {
      ok: false,
      error:
        "Replay blocked for signature-invalid events. Fix credentials and rely on a new delivery, or use the explicit platform override with audit justification.",
    };
  }

  const auditAction =
    input.surface === "platform"
      ? PLATFORM_WEBHOOK_REPLAY_REQUESTED
      : "WEBHOOK_REPLAY_REQUESTED";

  try {
    await auditLog({
      actor: { userId: input.actorUserId, email: input.actorEmail },
      action: auditAction,
      category: input.surface === "platform" ? "PLATFORM" : "WEBHOOKS",
      source: "SYSTEM",
      severity: "INFO",
      entity: { type: "WebhookEvent", id: event.id, label: `${event.provider}:${event.topic}` },
      metadata: {
        surface: input.surface,
        provider: event.provider,
        topic: event.topic,
        signatureValid: event.signatureValid,
        asyncQueue: isWebhookAsyncQueueEnabled(),
        ...buildAuditReasonMetadata({ rawReason: reason, category: "WEBHOOK_REPLAY" }),
      },
    });

    if (isWebhookAsyncQueueEnabled()) {
      if (!isWebhookAsyncSupportedProvider(event.provider as IntegrationProvider)) {
        return {
          ok: false,
          error:
            "Async replay is only supported for WooCommerce and Shopify. Other providers remain inline-only.",
        };
      }

      await prisma.$transaction(async (tx) => {
        await tx.webhookEvent.update({
          where: { id: event.id },
          data: { processed: false, processingError: null, processedAt: null },
        });
        const existing = await tx.webhookProcessingJob.findUnique({
          where: { webhookEventId: event.id },
        });
        if (existing) {
          await tx.webhookProcessingJob.update({
            where: { id: existing.id },
            data: {
              status: WebhookProcessingJobStatus.QUEUED,
              attemptCount: 0,
              nextAttemptAt: null,
              lockedAt: null,
              lastError: null,
              maxAttempts: getWebhookJobMaxAttempts(),
            },
          });
        } else {
          const workspaceId = await resolveWebhookJobWorkspaceId({
            userId: event.userId,
            workspaceId: event.workspaceId,
          });
          await tx.webhookProcessingJob.create({
            data: {
              webhookEventId: event.id,
              userId: event.userId,
              workspaceId,
              provider: event.provider,
              maxAttempts: getWebhookJobMaxAttempts(),
              status: WebhookProcessingJobStatus.QUEUED,
            },
          });
        }
      });
      return { ok: true };
    }

    if (!isWebhookAsyncSupportedProvider(event.provider as IntegrationProvider)) {
      return {
        ok: false,
        error: `Inline replay is not enabled for provider ${event.provider} in this release.`,
      };
    }

    try {
      await executeInboundWebhookByProvider({
        provider: event.provider,
        userId: event.userId,
        connectionId: event.connectionId,
        webhookEventId: event.id,
        topic: event.topic,
        payload: event.payloadJson,
      });
      await markWebhookProcessed(event.id, true);
      return { ok: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      captureErrorSafe(e, { module: "webhook_replay", webhookEventId: event.id });
      await markWebhookProcessed(event.id, false, msg);
      return { ok: false, error: msg };
    }
  } catch (e) {
    captureErrorSafe(e, { module: "webhook_replay", webhookEventId: input.webhookEventId });
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
