import type { Prisma } from "@prisma/client";

import { DAILY_PL_WIDGET_P2_47_STORAGE_KEY } from "@/lib/finance/daily-pl-widget-p2-47-policy";
import { prisma } from "@/lib/prisma";

export type DailyPlWidgetSettings = {
  dailyRevenueTarget: number | null;
};

export function readDailyPlWidgetSettings(
  settingsCenterJson: unknown,
): DailyPlWidgetSettings {
  if (
    !settingsCenterJson ||
    typeof settingsCenterJson !== "object" ||
    Array.isArray(settingsCenterJson)
  ) {
    return { dailyRevenueTarget: null };
  }

  const center = settingsCenterJson as Record<string, unknown>;
  const raw = center[DAILY_PL_WIDGET_P2_47_STORAGE_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { dailyRevenueTarget: null };
  }

  const block = raw as Record<string, unknown>;
  const target = block.dailyRevenueTarget;
  const dailyRevenueTarget =
    typeof target === "number" && Number.isFinite(target) && target > 0 ? target : null;

  return { dailyRevenueTarget };
}

export async function loadDailyPlWidgetSettings(userId: string): Promise<DailyPlWidgetSettings> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });
  return readDailyPlWidgetSettings(kitchen?.settingsCenterJson ?? null);
}

export async function saveDailyPlWidgetSettings(
  userId: string,
  patch: Partial<DailyPlWidgetSettings>,
): Promise<DailyPlWidgetSettings> {
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

  const current = readDailyPlWidgetSettings(center);
  const next: DailyPlWidgetSettings = { ...current, ...patch };
  center[DAILY_PL_WIDGET_P2_47_STORAGE_KEY] = next;

  await prisma.kitchenSettings.upsert({
    where: { userId },
    create: { userId, settingsCenterJson: center as Prisma.InputJsonValue },
    update: { settingsCenterJson: center as Prisma.InputJsonValue },
  });

  return next;
}
