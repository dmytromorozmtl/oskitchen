import type { NotificationType, Prisma } from "@prisma/client";
import { Resend } from "resend";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { canSendEmails, getProviderMode } from "@/lib/notifications/provider-resend";
import {
  isMarketingTemplate,
  getSystemTemplate,
} from "@/lib/notifications/template-registry";
import { renderTemplate, type TemplateVariables } from "@/lib/notifications/template-renderer";
import type { NotificationCategory, NotificationChannelKey } from "@/lib/notifications/notification-types";
import type { NotificationStatusKey } from "@/lib/notifications/notification-status";

export type SendNotificationInput = {
  userId: string;
  templateKey: string;
  /** Mapped to legacy enum for backward compat. */
  type: NotificationType;
  category: NotificationCategory;
  channel: NotificationChannelKey;
  recipient: string;
  recipientCustomerId?: string | null;
  recipientUserId?: string | null;
  variables: TemplateVariables;
  triggerType?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  ruleId?: string | null;
  dedupeKey: string;
  metadata?: Record<string, unknown>;
};

export type SendNotificationResult =
  | { ok: true; status: NotificationStatusKey; logId: string; providerMessageId?: string | null }
  | { ok: false; status: NotificationStatusKey; logId: string | null; reason: string };

function toJson(meta: Record<string, unknown> | undefined): Prisma.InputJsonValue | undefined {
  if (!meta) return undefined;
  try {
    return JSON.parse(JSON.stringify(meta)) as Prisma.InputJsonValue;
  } catch {
    return undefined;
  }
}

function isValidEmail(value: string): boolean {
  return /.+@.+\..+/.test(value);
}

/**
 * Check customer-level consent for the workspace, gated by the
 * template's marketing flag. Transactional templates bypass the check
 * (operator/legitimate-interest basis).
 */
async function recipientAllowed(input: SendNotificationInput): Promise<{ allowed: boolean; reason?: string }> {
  if (!isMarketingTemplate(input.templateKey)) return { allowed: true };
  if (input.recipientCustomerId) {
    const pref = await prisma.notificationPreference.findUnique({
      where: { userId_customerId: { userId: input.userId, customerId: input.recipientCustomerId } },
    }).catch(() => null);
    if (pref) {
      if (pref.mutedUntil && pref.mutedUntil > new Date()) {
        return { allowed: false, reason: "Recipient muted." };
      }
      if (!pref.emailMarketingEnabled && !pref.emailReminderEnabled) {
        return { allowed: false, reason: "Recipient opted out of marketing/reminder email." };
      }
    } else {
      // No preference row → fall back to KitchenCustomer.marketingConsent.
      const c = await prisma.kitchenCustomer.findFirst({
        where: { id: input.recipientCustomerId, userId: input.userId },
        select: { marketingConsent: true, status: true },
      }).catch(() => null);
      if (c && c.status !== "ACTIVE") {
        return { allowed: false, reason: "Customer not active." };
      }
      if (c && !c.marketingConsent) {
        return { allowed: false, reason: "Customer has not given marketing consent." };
      }
    }
  }
  return { allowed: true };
}

async function recordLog(
  input: SendNotificationInput,
  status: NotificationStatusKey,
  extra: Partial<{
    subject: string;
    providerMessageId: string;
    errorMessage: string;
    sentAt: Date;
    failedAt: Date;
  }>,
): Promise<string | null> {
  try {
    const created = await prisma.notificationLog.create({
      data: {
        userId: input.userId,
        type: input.type,
        dedupeKey: input.dedupeKey,
        recipient: input.recipient,
        status,
        category: input.category,
        channel: input.channel,
        provider: getProviderMode(),
        templateKey: input.templateKey,
        ruleId: input.ruleId ?? undefined,
        recipientUserId: input.recipientUserId ?? undefined,
        recipientCustomerId: input.recipientCustomerId ?? undefined,
        triggerType: input.triggerType ?? undefined,
        sourceType: input.sourceType ?? undefined,
        sourceId: input.sourceId ?? undefined,
        metadata: toJson(input.metadata),
        subject: extra.subject ?? undefined,
        providerMessageId: extra.providerMessageId ?? undefined,
        errorMessage: extra.errorMessage ?? undefined,
        sentAt: extra.sentAt,
        failedAt: extra.failedAt,
      },
      select: { id: true },
    });
    return created.id;
  } catch (e) {
    // P2002 dedupe collision means a duplicate — record as SKIPPED in a separate row using a salted key.
    if (status !== "SKIPPED") {
      try {
        const fallback = await prisma.notificationLog.create({
          data: {
            userId: input.userId,
            type: input.type,
            dedupeKey: `${input.dedupeKey}|dupe|${Date.now()}`,
            recipient: input.recipient,
            status: "SKIPPED",
            category: input.category,
            channel: input.channel,
            provider: getProviderMode(),
            templateKey: input.templateKey,
            ruleId: input.ruleId ?? undefined,
            triggerType: input.triggerType ?? undefined,
            sourceType: input.sourceType ?? undefined,
            sourceId: input.sourceId ?? undefined,
            errorMessage: "Dedupe collision on primary key.",
          },
          select: { id: true },
        });
        return fallback.id;
      } catch (err) {
        logger.warn("notification log fallback failed", err);
      }
    }
    logger.warn("notification log insert failed", e);
    return null;
  }
}

/**
 * Send (or simulate sending) a transactional / reminder / internal
 * notification. Never throws — always returns a structured outcome and
 * records a row in `notification_logs`.
 */
export async function sendNotification(input: SendNotificationInput): Promise<SendNotificationResult> {
  // 1. Validate template
  const tpl = getSystemTemplate(input.templateKey);
  if (!tpl) {
    const logId = await recordLog(input, "FAILED", { failedAt: new Date(), errorMessage: `Unknown template: ${input.templateKey}` });
    return { ok: false, status: "FAILED", logId, reason: "Unknown template." };
  }

  // 2. Validate recipient
  if (input.channel === "EMAIL" && !isValidEmail(input.recipient)) {
    const logId = await recordLog(input, "FAILED", { failedAt: new Date(), errorMessage: "Recipient address is invalid." });
    return { ok: false, status: "FAILED", logId, reason: "Invalid email recipient." };
  }

  // 3. Consent / preference check
  const consent = await recipientAllowed(input);
  if (!consent.allowed) {
    const logId = await recordLog(input, "SKIPPED", { errorMessage: consent.reason });
    return { ok: false, status: "SKIPPED", logId, reason: consent.reason ?? "Recipient opted out." };
  }

  // 4. Render
  const rendered = renderTemplate({ templateKey: input.templateKey, variables: input.variables });
  if (!rendered) {
    const logId = await recordLog(input, "FAILED", { failedAt: new Date(), errorMessage: "Template render failed." });
    return { ok: false, status: "FAILED", logId, reason: "Template render failed." };
  }

  // 5. Provider gate
  if (input.channel !== "EMAIL") {
    const logId = await recordLog(input, "SENT", { subject: rendered.subject, sentAt: new Date() });
    return { ok: true, status: "SENT", logId: logId ?? "" };
  }

  if (!canSendEmails()) {
    // Log-only mode: write SKIPPED with an explicit reason. No fake "delivered".
    const logId = await recordLog(input, "SKIPPED", { subject: rendered.subject, errorMessage: "Provider not configured — log-only mode." });
    return { ok: false, status: "SKIPPED", logId, reason: "Email provider not configured." };
  }

  // 6. Real send via Resend
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "KitchenOS <onboarding@resend.dev>";
  if (!key) {
    const logId = await recordLog(input, "SKIPPED", { subject: rendered.subject, errorMessage: "RESEND_API_KEY missing." });
    return { ok: false, status: "SKIPPED", logId, reason: "RESEND_API_KEY missing." };
  }
  try {
    const resend = new Resend(key);
    const res = await resend.emails.send({
      from,
      to: input.recipient,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
    const providerMessageId = (res.data?.id as string | undefined) ?? null;
    if (res.error) {
      const logId = await recordLog(input, "FAILED", {
        subject: rendered.subject,
        failedAt: new Date(),
        errorMessage: typeof res.error?.message === "string" ? res.error.message.slice(0, 1000) : "Unknown provider error.",
      });
      return { ok: false, status: "FAILED", logId, reason: res.error.message ?? "Provider error." };
    }
    const logId = await recordLog(input, "SENT", {
      subject: rendered.subject,
      providerMessageId: providerMessageId ?? undefined,
      sentAt: new Date(),
    });
    return { ok: true, status: "SENT", logId: logId ?? "", providerMessageId };
  } catch (e) {
    const logId = await recordLog(input, "FAILED", {
      subject: rendered.subject,
      failedAt: new Date(),
      errorMessage: e instanceof Error ? e.message.slice(0, 1000) : "Send failed.",
    });
    return { ok: false, status: "FAILED", logId, reason: e instanceof Error ? e.message : "Send failed." };
  }
}

/** Retry a previously failed notification. Returns a fresh outcome. */
export async function retryNotification(logId: string, actorUserId: string): Promise<SendNotificationResult> {
  const log = await prisma.notificationLog.findFirst({
    where: { id: logId, userId: actorUserId },
  });
  if (!log) return { ok: false, status: "FAILED", logId: null, reason: "Log not found." };
  if (!log.templateKey || !log.recipient || !log.category || !log.channel) {
    return { ok: false, status: "FAILED", logId, reason: "Log is missing fields required for retry." };
  }
  if (log.retryCount >= 5) {
    return { ok: false, status: "FAILED", logId, reason: "Maximum retry attempts reached." };
  }

  await prisma.notificationLog.update({
    where: { id: log.id },
    data: { status: "RETRYING", retryCount: { increment: 1 }, errorMessage: null },
  });

  const result = await sendNotification({
    userId: log.userId,
    templateKey: log.templateKey,
    type: log.type,
    category: log.category as NotificationCategory,
    channel: log.channel as NotificationChannelKey,
    recipient: log.recipient,
    recipientCustomerId: log.recipientCustomerId,
    recipientUserId: log.recipientUserId,
    variables: {},
    triggerType: log.triggerType,
    sourceType: log.sourceType,
    sourceId: log.sourceId ?? undefined,
    ruleId: log.ruleId ?? undefined,
    dedupeKey: `${log.dedupeKey}|retry|${log.retryCount + 1}`,
    metadata: { retryOf: log.id },
  });

  return result;
}

export async function cancelQueuedNotification(logId: string, actorUserId: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const log = await prisma.notificationLog.findFirst({ where: { id: logId, userId: actorUserId } });
  if (!log) return { ok: false, reason: "Log not found." };
  if (log.status !== "QUEUED" && log.status !== "RETRYING") {
    return { ok: false, reason: "Only queued/retrying notifications can be cancelled." };
  }
  await prisma.notificationLog.update({ where: { id: log.id }, data: { status: "CANCELLED" } });
  return { ok: true };
}
