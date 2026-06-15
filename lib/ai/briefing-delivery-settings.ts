import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/** Owner-configurable AI briefing delivery channels (stored in settingsCenterJson.aiBriefingDelivery). */
export type BriefingDeliverySettings = {
  email: {
    enabled: boolean;
    address: string | null;
    /** Local time HH:mm (24h) in workspace timezone. */
    deliveryTimeLocal: string;
  };
  sms: {
    enabled: boolean;
    number: string | null;
    /** When true, SMS only fires for critical predictive alerts. */
    criticalOnly: boolean;
  };
};

export const DEFAULT_BRIEFING_DELIVERY_SETTINGS: BriefingDeliverySettings = {
  email: {
    enabled: false,
    address: null,
    deliveryTimeLocal: "07:00",
  },
  sms: {
    enabled: false,
    number: null,
    criticalOnly: true,
  },
};

function isValidTimeLocal(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function mergeBriefingDeliverySettings(raw: unknown): BriefingDeliverySettings {
  const base: BriefingDeliverySettings = JSON.parse(
    JSON.stringify(DEFAULT_BRIEFING_DELIVERY_SETTINGS),
  ) as BriefingDeliverySettings;
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;

  if (o.email && typeof o.email === "object") {
    const e = o.email as Record<string, unknown>;
    if (typeof e.enabled === "boolean") base.email.enabled = e.enabled;
    if (typeof e.address === "string") base.email.address = e.address.trim() || null;
    if (typeof e.deliveryTimeLocal === "string" && isValidTimeLocal(e.deliveryTimeLocal)) {
      base.email.deliveryTimeLocal = e.deliveryTimeLocal;
    }
  }

  if (o.sms && typeof o.sms === "object") {
    const s = o.sms as Record<string, unknown>;
    if (typeof s.enabled === "boolean") base.sms.enabled = s.enabled;
    if (typeof s.number === "string") base.sms.number = s.number.trim() || null;
    if (typeof s.criticalOnly === "boolean") base.sms.criticalOnly = s.criticalOnly;
  }

  return base;
}

export async function loadBriefingDeliverySettings(userId: string): Promise<BriefingDeliverySettings> {
  const [kitchen, profile] = await Promise.all([
    prisma.kitchenSettings.findUnique({
      where: { userId },
      select: { settingsCenterJson: true, timezone: true },
    }),
    prisma.userProfile.findUnique({
      where: { id: userId },
      select: { email: true },
    }),
  ]);

  const center = kitchen?.settingsCenterJson;
  const raw =
    center && typeof center === "object" && !Array.isArray(center)
      ? (center as Record<string, unknown>).aiBriefingDelivery
      : undefined;

  const merged = mergeBriefingDeliverySettings(raw);

  if (!merged.email.address && profile?.email) {
    merged.email.address = profile.email;
  }

  return merged;
}

export async function saveBriefingDeliverySettings(
  userId: string,
  patch: Partial<BriefingDeliverySettings>,
): Promise<BriefingDeliverySettings> {
  const existing = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });

  const center =
    existing?.settingsCenterJson && typeof existing.settingsCenterJson === "object"
      ? { ...(existing.settingsCenterJson as Record<string, unknown>) }
      : {};

  const current = mergeBriefingDeliverySettings(center.aiBriefingDelivery);
  const next = mergeBriefingDeliverySettings({
    email: { ...current.email, ...patch.email },
    sms: { ...current.sms, ...patch.sms },
  });

  center.aiBriefingDelivery = next;

  await prisma.kitchenSettings.upsert({
    where: { userId },
    create: { userId, settingsCenterJson: center as Prisma.InputJsonValue },
    update: { settingsCenterJson: center as Prisma.InputJsonValue },
  });

  return next;
}

/** True when local wall-clock matches configured delivery minute (± window). */
export function isBriefingDeliveryDue(
  deliveryTimeLocal: string,
  timezone: string,
  now = new Date(),
  windowMinutes = 15,
): boolean {
  if (!isValidTimeLocal(deliveryTimeLocal)) return false;

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const nowMinutes = hour * 60 + minute;

  const [th, tm] = deliveryTimeLocal.split(":").map(Number);
  const targetMinutes = th * 60 + tm;

  return Math.abs(nowMinutes - targetMinutes) <= windowMinutes;
}
