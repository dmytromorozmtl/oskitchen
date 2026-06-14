import { prisma } from "@/lib/prisma";
import { notificationLogListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import type { NotificationCategory } from "@/lib/notifications/notification-types";
import { sendNotification } from "@/services/notifications/notification-service";
import type { NotificationType } from "@prisma/client";
import { staticDedupeKey } from "@/lib/notifications/dedupe";

export type InternalAlertInput = {
  userId: string;
  /** Stable template key from the system registry (e.g. internal_failed_webhook). */
  templateKey: string;
  /** Trigger string like "WEBHOOK_FAILED", "PRODUCTION_BLOCKER", etc. */
  triggerType: string;
  sourceType: string;
  sourceId: string;
  /** Free-text variable rendered as {{reason}}. */
  reason: string;
  /** Optional link rendered as {{link}}. */
  link?: string;
  /** Which workspace member email receives the alert. */
  recipientEmail: string;
  /** Optional staff member id (in-app surface, log linkage). */
  recipientUserId?: string;
  /** Category to record on the log. */
  category?: NotificationCategory;
};

/**
 * Send an internal alert. Always logs (even when provider is missing).
 * Idempotent per (templateKey, recipient, sourceType, sourceId).
 */
export async function fireInternalAlert(input: InternalAlertInput): Promise<{ ok: boolean; status: string; logId: string | null; reason?: string }> {
  const dedupeKey = staticDedupeKey(input.templateKey, input.recipientEmail, input.sourceType, input.sourceId);

  const res = await sendNotification({
    userId: input.userId,
    templateKey: input.templateKey,
    type: "CRON_REMINDER" as NotificationType,
    category: input.category ?? "INTERNAL_ALERT",
    channel: "EMAIL",
    recipient: input.recipientEmail,
    recipientUserId: input.recipientUserId,
    variables: { reason: input.reason, link: input.link ?? "" },
    triggerType: input.triggerType,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    dedupeKey,
    metadata: { internal: true },
  });

  return res.ok
    ? { ok: true, status: res.status, logId: res.logId }
    : { ok: false, status: res.status, logId: res.logId, reason: res.reason };
}

/** Convenience: list recent internal alerts. */
export async function listRecentInternalAlerts(userId: string, limit = 50) {
  const scope = await notificationLogListWhereForOwner(userId);
  return prisma.notificationLog.findMany({
    where: { AND: [scope, { category: "INTERNAL_ALERT" }] },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
