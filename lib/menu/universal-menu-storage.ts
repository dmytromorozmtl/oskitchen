import type { Prisma } from "@prisma/client";

import {
  parseUniversalMenuStorage,
} from "@/lib/menu/universal-menu-builders";
import type { MenuChannel, StoredUniversalMenuItem, UniversalMenuSyncHistoryEntry } from "@/lib/menu/universal-menu-types";
import { prisma } from "@/lib/prisma";

const STORAGE_KEY = "universalMenu";

function readStorageFromCenter(center: unknown): ReturnType<typeof parseUniversalMenuStorage> {
  if (!center || typeof center !== "object" || Array.isArray(center)) {
    return parseUniversalMenuStorage(undefined);
  }
  return parseUniversalMenuStorage((center as Record<string, unknown>)[STORAGE_KEY]);
}

export async function loadUniversalMenuStorage(userId: string): Promise<ReturnType<typeof parseUniversalMenuStorage>> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });

  return readStorageFromCenter(kitchen?.settingsCenterJson ?? null);
}

export async function saveUniversalMenuItemStorage(
  userId: string,
  productId: string,
  stored: StoredUniversalMenuItem,
): Promise<void> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });

  const center =
    kitchen?.settingsCenterJson && typeof kitchen.settingsCenterJson === "object" && !Array.isArray(kitchen.settingsCenterJson)
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};

  const storage = parseUniversalMenuStorage(center[STORAGE_KEY]);
  storage.items[productId] = stored;
  center[STORAGE_KEY] = storage;

  await prisma.kitchenSettings.upsert({
    where: { userId },
    create: { userId, settingsCenterJson: center as Prisma.InputJsonValue },
    update: { settingsCenterJson: center as Prisma.InputJsonValue },
  });
}

export async function appendUniversalMenuSyncHistory(
  userId: string,
  productId: string,
  entries: UniversalMenuSyncHistoryEntry[],
): Promise<void> {
  const storage = await loadUniversalMenuStorage(userId);
  const existing = storage.items[productId] ?? { channelOverrides: {}, syncStatus: {}, syncHistory: [] };
  const history = [...(existing.syncHistory ?? []), ...entries].slice(-100);
  await saveUniversalMenuItemStorage(userId, productId, { ...existing, syncHistory: history });
}

export async function getStoredUniversalMenuItem(
  userId: string,
  productId: string,
): Promise<StoredUniversalMenuItem | null> {
  const storage = await loadUniversalMenuStorage(userId);
  return storage.items[productId] ?? null;
}

export async function listStoredUniversalMenuProductIds(userId: string): Promise<string[]> {
  const storage = await loadUniversalMenuStorage(userId);
  return Object.keys(storage.items);
}

export function channelSyncHistoryForProduct(
  stored: StoredUniversalMenuItem | null,
  channel?: MenuChannel,
): UniversalMenuSyncHistoryEntry[] {
  const history = stored?.syncHistory ?? [];
  if (!channel) return history;
  return history.filter((h) => h.channel === channel);
}
