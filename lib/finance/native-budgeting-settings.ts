import { prisma } from "@/lib/prisma";
import {
  NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES,
} from "@/lib/finance/native-budgeting-p3-91-content";
import type {
  NativeBudgetCategoryKey,
  NativeBudgetSettings,
} from "@/lib/finance/native-budgeting-types";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const DEFAULT_NATIVE_BUDGET_SETTINGS: NativeBudgetSettings = {
  revenueTargetUsd: null,
  categoryOverrides: {},
  updatedAt: null,
};

function parsePercent(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) return parsed;
  }
  return undefined;
}

export function parseNativeBudgetSettings(raw: unknown): NativeBudgetSettings {
  if (!isPlainObject(raw)) return { ...DEFAULT_NATIVE_BUDGET_SETTINGS };

  let revenueTargetUsd: number | null = null;
  const rev = raw.revenueTargetUsd;
  if (typeof rev === "number" && Number.isFinite(rev) && rev > 0) {
    revenueTargetUsd = rev;
  }

  const categoryOverrides: Partial<Record<NativeBudgetCategoryKey, number>> = {};
  if (isPlainObject(raw.categoryOverrides)) {
    for (const cat of NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES) {
      const pct = parsePercent(raw.categoryOverrides[cat.key]);
      if (pct != null) categoryOverrides[cat.key] = pct;
    }
  }

  const updatedAt = typeof raw.updatedAt === "string" ? raw.updatedAt : null;

  return { revenueTargetUsd, categoryOverrides, updatedAt };
}

export function nativeBudgetFromSettingsCenter(settingsCenterJson: unknown): NativeBudgetSettings {
  if (!isPlainObject(settingsCenterJson)) return { ...DEFAULT_NATIVE_BUDGET_SETTINGS };
  if (!isPlainObject(settingsCenterJson.finance)) return { ...DEFAULT_NATIVE_BUDGET_SETTINGS };
  return parseNativeBudgetSettings(settingsCenterJson.finance.nativeBudget);
}

export function mergeNativeBudgetIntoSettingsCenter(
  settingsCenterJson: unknown,
  next: NativeBudgetSettings,
): Record<string, unknown> {
  const base = isPlainObject(settingsCenterJson) ? { ...settingsCenterJson } : {};
  const finance = isPlainObject(base.finance) ? { ...base.finance } : {};
  finance.nativeBudget = {
    ...next,
    updatedAt: new Date().toISOString(),
  };
  base.finance = finance;
  return base;
}

export async function loadNativeBudgetSettings(userId: string): Promise<NativeBudgetSettings> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });
  return nativeBudgetFromSettingsCenter(kitchen?.settingsCenterJson);
}

export async function saveNativeBudgetSettings(
  userId: string,
  patch: Partial<NativeBudgetSettings>,
): Promise<NativeBudgetSettings> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });
  const current = nativeBudgetFromSettingsCenter(kitchen?.settingsCenterJson);
  const next: NativeBudgetSettings = {
    revenueTargetUsd: patch.revenueTargetUsd ?? current.revenueTargetUsd,
    categoryOverrides: { ...current.categoryOverrides, ...patch.categoryOverrides },
    updatedAt: new Date().toISOString(),
  };
  const merged = mergeNativeBudgetIntoSettingsCenter(kitchen?.settingsCenterJson, next);
  await prisma.kitchenSettings.upsert({
    where: { userId },
    create: { userId, settingsCenterJson: merged },
    update: { settingsCenterJson: merged },
  });
  return next;
}

export function resolveCategoryPercent(
  key: NativeBudgetCategoryKey,
  settings: NativeBudgetSettings,
): number {
  const override = settings.categoryOverrides[key];
  if (override != null) return override;
  const def = NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES.find((c) => c.key === key);
  return def?.percentOfRevenue ?? 0;
}
