import type { Prisma } from "@prisma/client";

import { LABOR_COST_WIDGET_P2_49_STORAGE_KEY } from "@/lib/staff/labor-cost-widget-p2-49-policy";
import { prisma } from "@/lib/prisma";

export type LaborCostWidgetSettings = {
  targetLaborPercent: number | null;
};

export function readLaborCostWidgetSettings(settingsCenterJson: unknown): LaborCostWidgetSettings {
  if (
    !settingsCenterJson ||
    typeof settingsCenterJson !== "object" ||
    Array.isArray(settingsCenterJson)
  ) {
    return { targetLaborPercent: null };
  }

  const center = settingsCenterJson as Record<string, unknown>;
  const raw = center[LABOR_COST_WIDGET_P2_49_STORAGE_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { targetLaborPercent: null };
  }

  const block = raw as Record<string, unknown>;
  const target = block.targetLaborPercent;
  const targetLaborPercent =
    typeof target === "number" && Number.isFinite(target) && target > 0 && target <= 100
      ? target
      : null;

  return { targetLaborPercent };
}

export async function loadLaborCostWidgetSettings(userId: string): Promise<LaborCostWidgetSettings> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });
  return readLaborCostWidgetSettings(kitchen?.settingsCenterJson ?? null);
}

export async function saveLaborCostWidgetSettings(
  userId: string,
  patch: Partial<LaborCostWidgetSettings>,
): Promise<LaborCostWidgetSettings> {
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

  const current = readLaborCostWidgetSettings(center);
  const next: LaborCostWidgetSettings = { ...current, ...patch };
  center[LABOR_COST_WIDGET_P2_49_STORAGE_KEY] = next;

  await prisma.kitchenSettings.upsert({
    where: { userId },
    create: { userId, settingsCenterJson: center as Prisma.InputJsonValue },
    update: { settingsCenterJson: center as Prisma.InputJsonValue },
  });

  return next;
}
