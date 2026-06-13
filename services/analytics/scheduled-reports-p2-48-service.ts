import { isEmailConfigured, sendRawEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import {
  buildScheduledReportDedupeKey,
  formatScheduledReportEmail,
  resolveNextWeeklySendLabel,
  resolveWeeklyReportWindow,
} from "@/lib/analytics/scheduled-reports-p2-48-measurement";
import { buildScheduledReportPdfAttachment } from "@/lib/analytics/scheduled-reports-p2-48-pdf";
import {
  SCHEDULED_REPORTS_P2_48_DEFAULT_REPORT_KEY,
  SCHEDULED_REPORTS_P2_48_POLICY_ID,
  SCHEDULED_REPORTS_P2_48_REPORTS_ROUTE,
} from "@/lib/analytics/scheduled-reports-p2-48-policy";
import {
  loadScheduledReportsSettings,
  readScheduledReportsSettings,
  saveScheduledReportsSettings,
  type ScheduledReportsSettings,
} from "@/lib/analytics/scheduled-reports-p2-48-storage";
import { tryRecordNotification } from "@/lib/notification-log";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import type { ReportKey } from "@/lib/reports/report-types";
import { prisma } from "@/lib/prisma";
import {
  recordReportExport,
  runReport,
} from "@/services/reports/report-service";

export type ScheduledReportsPanelPayload = {
  policyId: typeof SCHEDULED_REPORTS_P2_48_POLICY_ID;
  settings: ScheduledReportsSettings;
  nextSendLabel: string;
  reportsHref: string;
  reportTitle: string;
};

export async function loadScheduledReportsPanelModel(
  userId: string,
  now = new Date(),
): Promise<ScheduledReportsPanelPayload> {
  const settings = await loadScheduledReportsSettings(userId);

  const reportKey = settings.reportKey || SCHEDULED_REPORTS_P2_48_DEFAULT_REPORT_KEY;
  const reportTitle =
    reportKey === "executive_weekly_summary"
      ? "Executive weekly summary"
      : reportKey.replace(/_/g, " ");

  return {
    policyId: SCHEDULED_REPORTS_P2_48_POLICY_ID,
    settings,
    nextSendLabel: resolveNextWeeklySendLabel(now),
    reportsHref: SCHEDULED_REPORTS_P2_48_REPORTS_ROUTE,
    reportTitle,
  };
}

export async function sendWeeklyScheduledReportEmail(
  userId: string,
  now = new Date(),
): Promise<{ sent: boolean; skipped: boolean; reason?: string }> {
  if (!isEmailConfigured()) {
    return { sent: false, skipped: true, reason: "email_not_configured" };
  }

  const settings = await loadScheduledReportsSettings(userId);
  if (!settings.enabled) {
    return { sent: false, skipped: true, reason: "disabled" };
  }

  const [owner, kitchen] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: userId },
      select: { email: true },
    }),
    prisma.kitchenSettings.findUnique({
      where: { userId },
      select: { businessName: true },
    }),
  ]);

  const recipient = settings.recipientEmail ?? owner?.email ?? null;
  if (!recipient) {
    return { sent: false, skipped: true, reason: "no_recipient" };
  }

  const window = resolveWeeklyReportWindow(now);
  const dedupeKey = buildScheduledReportDedupeKey(userId, window.weekKey);
  const inserted = await tryRecordNotification({
    userId,
    type: "CRON_REMINDER",
    dedupeKey,
    recipient,
    metadata: { channel: "email", kind: "scheduled_report_p2_48" },
  });
  if (!inserted) {
    return { sent: false, skipped: true, reason: "already_sent" };
  }

  const scope = createReportActorScope({
    sessionUserId: userId,
    userId,
    workspaceRole: "OWNER",
    email: owner?.email ?? null,
  });

  const reportKey: ReportKey = settings.reportKey || SCHEDULED_REPORTS_P2_48_DEFAULT_REPORT_KEY;
  const result = await runReport(reportKey, {
    userId,
    scope,
    filters: { from: window.from, to: window.to },
  });

  if (result.status !== "ok") {
    return { sent: false, skipped: true, reason: "permission_denied" };
  }

  const summaryLines = result.summary.map((row) => `- ${row.label}: ${row.value}`);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.oskitchen.com";
  const { subject, text } = formatScheduledReportEmail({
    businessName: kitchen?.businessName ?? null,
    rangeLabel: result.rangeLabel,
    summaryLines,
    reportsUrl: `${siteUrl}${SCHEDULED_REPORTS_P2_48_REPORTS_ROUTE}`,
  });

  const attachment = await buildScheduledReportPdfAttachment(result);

  try {
    await sendRawEmail({
      to: recipient,
      subject,
      text,
      attachments: [attachment],
    });
  } catch (error) {
    logger.warn("scheduled_reports_p2_48_send_failed", error);
    return { sent: false, skipped: true, reason: "send_failed" };
  }

  await recordReportExport({
    userId,
    reportKey,
    filename: attachment.filename,
    rowCount: result.totalRows,
    filtersJson: { from: window.from.toISOString(), to: window.to.toISOString(), scheduled: true },
  });

  await saveScheduledReportsSettings(userId, { lastSentAt: now.toISOString() });

  return { sent: true, skipped: false };
}

export async function runScheduledReportsWeeklyBatch(now = new Date()): Promise<{
  processed: number;
  sent: number;
  skipped: number;
}> {
  const kitchens = await prisma.kitchenSettings.findMany({
    select: { userId: true, settingsCenterJson: true },
    take: 500,
  });

  let sent = 0;
  let skipped = 0;
  let processed = 0;

  for (const kitchen of kitchens) {
    const settings = readScheduledReportsSettings(kitchen.settingsCenterJson);
    if (!settings.enabled) continue;
    processed += 1;
    const result = await sendWeeklyScheduledReportEmail(kitchen.userId, now);
    if (result.sent) sent += 1;
    else skipped += 1;
  }

  return { processed, sent, skipped };
}
