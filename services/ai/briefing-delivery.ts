import { Resend } from "resend";

import {
  formatBriefingEmail,
  formatBriefingEmailSubject,
  formatBriefingEmailText,
  formatCriticalAlertsSms,
  pickCriticalAlertsForSms,
} from "@/lib/ai/briefing-delivery-format";
import {
  isBriefingDeliveryDue,
  loadBriefingDeliverySettings,
  type BriefingDeliverySettings,
} from "@/lib/ai/briefing-delivery-settings";
import { logger } from "@/lib/logger";
import { canSendEmails, getProviderMode } from "@/lib/notifications/provider-resend";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { generateDailyBriefing } from "@/services/ai/ai-restaurant-brain";
import { generatePredictiveAlerts } from "@/services/ai/predictive-alerts";
import { sendSmsNotification } from "@/services/notifications/sms-service";

export type BriefingDeliveryResult = {
  workspaceId: string;
  email: { attempted: boolean; ok: boolean; reason?: string };
  sms: { attempted: boolean; ok: boolean; reason?: string };
};

/** Load owner notification settings for AI briefing delivery. */
export async function getNotificationSettings(
  workspaceId: string,
): Promise<BriefingDeliverySettings & { timezone: string; ownerUserId: string }> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { timezone: true },
  });

  const settings = await loadBriefingDeliverySettings(ownerUserId);
  return {
    ...settings,
    timezone: kitchen?.timezone ?? "UTC",
    ownerUserId,
  };
}

/**
 * Deliver AI daily briefing via email and optional SMS for critical predictive alerts.
 * Respects owner-configured channels and delivery time (when `respectSchedule` is true).
 */
export async function deliverDailyBriefing(
  workspaceId: string,
  options?: { respectSchedule?: boolean; force?: boolean },
): Promise<BriefingDeliveryResult> {
  const config = await getNotificationSettings(workspaceId);
  const respectSchedule = options?.respectSchedule ?? true;
  const force = options?.force ?? false;

  if (
    respectSchedule &&
    !force &&
    config.email.enabled &&
    !isBriefingDeliveryDue(config.email.deliveryTimeLocal, config.timezone)
  ) {
    return {
      workspaceId,
      email: { attempted: false, ok: false, reason: "Outside configured delivery window." },
      sms: { attempted: false, ok: false, reason: "Outside configured delivery window." },
    };
  }

  const [briefing, alerts] = await Promise.all([
    generateDailyBriefing(workspaceId),
    generatePredictiveAlerts(workspaceId),
  ]);

  const emailHtml = formatBriefingEmail(briefing, alerts);
  const emailSubject = formatBriefingEmailSubject(briefing);
  const emailText = formatBriefingEmailText(briefing, alerts);

  const result: BriefingDeliveryResult = {
    workspaceId,
    email: { attempted: false, ok: false },
    sms: { attempted: false, ok: false },
  };

  if (config.email.enabled && config.email.address) {
    result.email.attempted = true;
    const emailOutcome = await sendBriefingEmail({
      userId: config.ownerUserId,
      workspaceId,
      to: config.email.address,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    });
    result.email.ok = emailOutcome.ok;
    result.email.reason = emailOutcome.reason;
  } else {
    result.email.reason = "Email delivery disabled or address missing.";
  }

  const smsAlerts = pickCriticalAlertsForSms(alerts, config.sms.criticalOnly);
  if (config.sms.enabled && config.sms.number && smsAlerts.some((a) => a.severity === "critical")) {
    result.sms.attempted = true;
    const smsBody = formatCriticalAlertsSms(smsAlerts);
    const smsOutcome = await sendSmsNotification({ to: config.sms.number, body: smsBody });
    result.sms.ok = smsOutcome.ok;
    result.sms.reason = smsOutcome.ok ? undefined : smsOutcome.error;

    await prisma.notificationLog.create({
      data: {
        userId: config.ownerUserId,
        type: "CRON_REMINDER",
        dedupeKey: `ai-briefing-sms:${workspaceId}:${briefing.timestamp.slice(0, 10)}`,
        recipient: config.sms.number,
        status: smsOutcome.ok ? "SENT" : smsOutcome.skipped ? "SKIPPED" : "FAILED",
        category: "INTERNAL_ALERT",
        channel: "SMS",
        provider: getProviderMode(),
        templateKey: "ai_daily_briefing_sms",
        triggerType: "ai_briefing_delivery",
        sourceType: "workspace",
        sourceId: workspaceId,
        errorMessage: smsOutcome.ok ? undefined : smsOutcome.error?.slice(0, 1000),
        sentAt: smsOutcome.ok ? new Date() : undefined,
        failedAt: smsOutcome.ok ? undefined : new Date(),
      },
    }).catch((e) => logger.warn("ai briefing sms log failed", e));
  } else if (config.sms.enabled && config.sms.number) {
    result.sms.reason = "No critical alerts — SMS skipped.";
  } else {
    result.sms.reason = "SMS delivery disabled or number missing.";
  }

  return result;
}

/** Cron-friendly: deliver only when local time matches configured schedule. */
export async function deliverDailyBriefingIfScheduled(workspaceId: string): Promise<BriefingDeliveryResult | null> {
  const config = await getNotificationSettings(workspaceId);
  if (!config.email.enabled && !config.sms.enabled) return null;
  if (!isBriefingDeliveryDue(config.email.deliveryTimeLocal, config.timezone)) return null;
  return deliverDailyBriefing(workspaceId, { respectSchedule: false, force: true });
}

export async function deliverDailyBriefingForUser(
  userId: string,
  options?: { respectSchedule?: boolean; force?: boolean },
): Promise<BriefingDeliveryResult> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) throw new Error(`No workspace for user: ${userId}`);
  return deliverDailyBriefing(workspaceId, options);
}

async function sendBriefingEmail(params: {
  userId: string;
  workspaceId: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const dedupeKey = `ai-briefing-email:${params.workspaceId}:${new Date().toISOString().slice(0, 10)}`;

  if (!canSendEmails()) {
    await prisma.notificationLog.create({
      data: {
        userId: params.userId,
        type: "CRON_REMINDER",
        dedupeKey,
        recipient: params.to,
        status: "SKIPPED",
        category: "INTERNAL_ALERT",
        channel: "EMAIL",
        provider: getProviderMode(),
        templateKey: "ai_daily_briefing",
        triggerType: "ai_briefing_delivery",
        sourceType: "workspace",
        sourceId: params.workspaceId,
        subject: params.subject,
        errorMessage: "Email provider not configured — log-only mode.",
      },
    }).catch(() => null);
    return { ok: false, reason: "Email provider not configured." };
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "OS Kitchen <onboarding@resend.dev>";
  if (!key) {
    return { ok: false, reason: "RESEND_API_KEY missing." };
  }

  try {
    const resend = new Resend(key);
    const res = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (res.error) {
      await prisma.notificationLog.create({
        data: {
          userId: params.userId,
          type: "CRON_REMINDER",
          dedupeKey,
          recipient: params.to,
          status: "FAILED",
          category: "INTERNAL_ALERT",
          channel: "EMAIL",
          provider: getProviderMode(),
          templateKey: "ai_daily_briefing",
          triggerType: "ai_briefing_delivery",
          sourceType: "workspace",
          sourceId: params.workspaceId,
          subject: params.subject,
          errorMessage: res.error.message?.slice(0, 1000) ?? "Provider error",
          failedAt: new Date(),
        },
      }).catch(() => null);
      return { ok: false, reason: res.error.message ?? "Provider error." };
    }

    await prisma.notificationLog.create({
      data: {
        userId: params.userId,
        type: "CRON_REMINDER",
        dedupeKey,
        recipient: params.to,
        status: "SENT",
        category: "INTERNAL_ALERT",
        channel: "EMAIL",
        provider: getProviderMode(),
        templateKey: "ai_daily_briefing",
        triggerType: "ai_briefing_delivery",
        sourceType: "workspace",
        sourceId: params.workspaceId,
        subject: params.subject,
        providerMessageId: res.data?.id ?? undefined,
        sentAt: new Date(),
      },
    }).catch(() => null);

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Send failed.";
    await prisma.notificationLog.create({
      data: {
        userId: params.userId,
        type: "CRON_REMINDER",
        dedupeKey,
        recipient: params.to,
        status: "FAILED",
        category: "INTERNAL_ALERT",
        channel: "EMAIL",
        provider: getProviderMode(),
        templateKey: "ai_daily_briefing",
        triggerType: "ai_briefing_delivery",
        sourceType: "workspace",
        sourceId: params.workspaceId,
        subject: params.subject,
        errorMessage: message.slice(0, 1000),
        failedAt: new Date(),
      },
    }).catch(() => null);
    return { ok: false, reason: message };
  }
}
