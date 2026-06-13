import type { Prisma } from "@prisma/client";

import {
  SCHEDULED_REPORTS_P2_48_DEFAULT_REPORT_KEY,
  SCHEDULED_REPORTS_P2_48_STORAGE_KEY,
} from "@/lib/analytics/scheduled-reports-p2-48-policy";
import type { ReportKey } from "@/lib/reports/report-types";
import { prisma } from "@/lib/prisma";

export type ScheduledReportsSettings = {
  enabled: boolean;
  reportKey: ReportKey;
  recipientEmail: string | null;
  lastSentAt: string | null;
};

const DEFAULTS: ScheduledReportsSettings = {
  enabled: false,
  reportKey: SCHEDULED_REPORTS_P2_48_DEFAULT_REPORT_KEY,
  recipientEmail: null,
  lastSentAt: null,
};

export function readScheduledReportsSettings(settingsCenterJson: unknown): ScheduledReportsSettings {
  if (
    !settingsCenterJson ||
    typeof settingsCenterJson !== "object" ||
    Array.isArray(settingsCenterJson)
  ) {
    return { ...DEFAULTS };
  }

  const center = settingsCenterJson as Record<string, unknown>;
  const raw = center[SCHEDULED_REPORTS_P2_48_STORAGE_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULTS };
  }

  const block = raw as Record<string, unknown>;
  const reportKey =
    typeof block.reportKey === "string" ? block.reportKey : DEFAULTS.reportKey;
  const recipientEmail =
    typeof block.recipientEmail === "string" && block.recipientEmail.includes("@")
      ? block.recipientEmail
      : null;
  const lastSentAt = typeof block.lastSentAt === "string" ? block.lastSentAt : null;

  return {
    enabled: block.enabled === true,
    reportKey: reportKey as ReportKey,
    recipientEmail,
    lastSentAt,
  };
}

export async function loadScheduledReportsSettings(
  userId: string,
): Promise<ScheduledReportsSettings> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });
  return readScheduledReportsSettings(kitchen?.settingsCenterJson ?? null);
}

export async function saveScheduledReportsSettings(
  userId: string,
  patch: Partial<ScheduledReportsSettings>,
): Promise<ScheduledReportsSettings> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });

  const center =
    kitchen?.settingsCenterJson &&
    typeof kitchen.settingsCenterJson === "object" &&
    !Array.isArray(kitchen.settingsCenterJson)
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};

  const current = readScheduledReportsSettings(center);
  const next: ScheduledReportsSettings = { ...current, ...patch };
  center[SCHEDULED_REPORTS_P2_48_STORAGE_KEY] = next;

  await prisma.kitchenSettings.upsert({
    where: { userId },
    create: { userId, settingsCenterJson: center as Prisma.InputJsonValue },
    update: { settingsCenterJson: center as Prisma.InputJsonValue },
  });

  return next;
}
