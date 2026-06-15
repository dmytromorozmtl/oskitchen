import type { Prisma } from "@prisma/client";

import type { DynamicPricingAbTest, DynamicPricingStorage } from "@/lib/ai/dynamic-pricing-types";
import { prisma } from "@/lib/prisma";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";

export const DYNAMIC_PRICING_STORAGE_KEY = "dynamicPricing";

export const EMPTY_DYNAMIC_PRICING_STORAGE: DynamicPricingStorage = {
  enabled: false,
  weatherOverride: null,
  abTests: [],
};

function parseAbTest(raw: unknown): DynamicPricingAbTest | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.productId !== "string") return null;
  return {
    id: o.id,
    productId: o.productId,
    productTitle: typeof o.productTitle === "string" ? o.productTitle : "Menu item",
    controlPrice: Number(o.controlPrice ?? 0),
    variantPrice: Number(o.variantPrice ?? 0),
    variantLabel: o.variantLabel === "B" ? "B" : "A",
    status: o.status === "completed" ? "completed" : "running",
    startedAtIso: typeof o.startedAtIso === "string" ? o.startedAtIso : new Date().toISOString(),
    ordersControl: Number(o.ordersControl ?? 0),
    ordersVariant: Number(o.ordersVariant ?? 0),
    revenueControl: Number(o.revenueControl ?? 0),
    revenueVariant: Number(o.revenueVariant ?? 0),
  };
}

export function parseDynamicPricingStorage(raw: unknown): DynamicPricingStorage {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...EMPTY_DYNAMIC_PRICING_STORAGE };
  }
  const o = raw as Record<string, unknown>;
  const tests: DynamicPricingAbTest[] = [];
  if (Array.isArray(o.abTests)) {
    for (const entry of o.abTests) {
      const parsed = parseAbTest(entry);
      if (parsed) tests.push(parsed);
    }
  }
  const weather = o.weatherOverride;
  const weatherOverride =
    weather === "rain" || weather === "heat" || weather === "cold" || weather === "clear"
      ? weather
      : null;

  return {
    enabled: o.enabled === true,
    weatherOverride,
    abTests: tests,
  };
}

export async function loadDynamicPricingStorage(ownerUserId: string): Promise<DynamicPricingStorage> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const center = kitchen?.settingsCenterJson;
  if (!center || typeof center !== "object" || Array.isArray(center)) {
    return { ...EMPTY_DYNAMIC_PRICING_STORAGE };
  }
  return parseDynamicPricingStorage((center as Record<string, unknown>)[DYNAMIC_PRICING_STORAGE_KEY]);
}

export async function saveDynamicPricingStorage(
  ownerUserId: string,
  storage: DynamicPricingStorage,
): Promise<void> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });

  const existing =
    kitchen?.settingsCenterJson &&
    typeof kitchen.settingsCenterJson === "object" &&
    !Array.isArray(kitchen.settingsCenterJson)
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};

  existing[DYNAMIC_PRICING_STORAGE_KEY] = storage;

  const workspaceId = await ensureOwnerWorkspaceId(ownerUserId);

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: {
      userId: ownerUserId,
      workspaceId,
      settingsCenterJson: existing as Prisma.InputJsonValue,
    },
    update: { settingsCenterJson: existing as Prisma.InputJsonValue, workspaceId },
  });
}
