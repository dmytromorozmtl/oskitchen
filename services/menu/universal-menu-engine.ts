import { Prisma } from "@prisma/client";

import {
  applyPushOutcomesToSyncStatus,
  buildUniversalMenuItem,
  mergeChannelOverrides,
  mergeSyncStatus,
} from "@/lib/menu/universal-menu-builders";
import {
  csvRowToItemUpdate,
  parseUniversalMenuCsv,
  exportUniversalMenuCsv,
} from "@/lib/menu/universal-menu-csv";
import type {
  BulkMenuItemPatch,
  ImportCsvResult,
  SyncAllResult,
  UniversalMenuDashboardPayload,
} from "@/lib/menu/universal-menu-dashboard-types";
import type {
  UniversalMenuItem,
  UniversalMenuItemUpdate,
  UniversalMenuMaster,
  UniversalMenuUpdateResult,
  MenuChannel,
} from "@/lib/menu/universal-menu-types";
import {
  appendUniversalMenuSyncHistory,
  getStoredUniversalMenuItem,
  loadUniversalMenuStorage,
  saveUniversalMenuItemStorage,
} from "@/lib/menu/universal-menu-storage";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  menuListWhereForOwner,
  productByIdWhereForOwner,
  productListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { pushMenuItemToAllChannels } from "@/services/menu/universal-menu-push";

export type {
  MenuChannel,
  UniversalMenuItem,
  UniversalMenuItemUpdate,
  UniversalMenuUpdateResult,
} from "@/lib/menu/universal-menu-types";
export type { UniversalMenuDashboardPayload, BulkMenuItemPatch, SyncAllResult, ImportCsvResult } from "@/lib/menu/universal-menu-dashboard-types";
export { exportUniversalMenuCsv } from "@/lib/menu/universal-menu-csv";

function decimalToNumber(value: Prisma.Decimal | number | string): number {
  if (value instanceof Prisma.Decimal) return value.toNumber();
  return Number(value);
}

function productToMaster(product: {
  title: string;
  description: string | null;
  price: Prisma.Decimal;
  category: string;
  image: string | null;
  active: boolean;
  posVisible: boolean;
  storefrontVisible: boolean;
}): UniversalMenuMaster {
  return {
    title: product.title,
    description: product.description,
    price: decimalToNumber(product.price),
    category: product.category,
    image: product.image,
    active: product.active,
    posVisible: product.posVisible,
    storefrontVisible: product.storefrontVisible,
  };
}

async function loadProductForOwner(userId: string, productId: string) {
  return prisma.product.findFirst({
    where: await productByIdWhereForOwner(userId, productId),
    select: {
      id: true,
      menuId: true,
      title: true,
      description: true,
      price: true,
      category: true,
      image: true,
      active: true,
      posVisible: true,
      storefrontVisible: true,
      updatedAt: true,
    },
  });
}

/** List master menu items with per-channel overrides and sync status. */
export async function listUniversalMenuItems(
  workspaceId: string,
  options?: { menuId?: string; search?: string; activeOnly?: boolean },
): Promise<UniversalMenuItem[]> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const scope = await productListWhereForOwner(ownerUserId);
  const where = {
    AND: [
      scope,
      options?.menuId ? { menuId: options.menuId } : {},
      options?.activeOnly ? { active: true } : {},
      options?.search
        ? {
            OR: [
              { title: { contains: options.search, mode: "insensitive" as const } },
              { category: { contains: options.search, mode: "insensitive" as const } },
            ],
          }
        : {},
    ],
  };

  const [products, storage] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      take: 500,
      select: {
        id: true,
        menuId: true,
        title: true,
        description: true,
        price: true,
        category: true,
        image: true,
        active: true,
        posVisible: true,
        storefrontVisible: true,
        updatedAt: true,
      },
    }),
    loadUniversalMenuStorage(ownerUserId),
  ]);

  return products.map((product) =>
    buildUniversalMenuItem({
      productId: product.id,
      menuId: product.menuId,
      master: productToMaster(product),
      stored: storage.items[product.id] ?? null,
      updatedAt: product.updatedAt.toISOString(),
    }),
  );
}

/** Load a single universal menu item. */
export async function getUniversalMenuItem(
  workspaceId: string,
  productId: string,
): Promise<UniversalMenuItem | null> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const [product, stored] = await Promise.all([
    loadProductForOwner(ownerUserId, productId),
    getStoredUniversalMenuItem(ownerUserId, productId),
  ]);

  if (!product) return null;

  return buildUniversalMenuItem({
    productId: product.id,
    menuId: product.menuId,
    master: productToMaster(product),
    stored,
    updatedAt: product.updatedAt.toISOString(),
  });
}

async function persistMasterUpdate(
  userId: string,
  productId: string,
  masterPatch: NonNullable<UniversalMenuItemUpdate["master"]>,
): Promise<UniversalMenuMaster | null> {
  const existing = await loadProductForOwner(userId, productId);
  if (!existing) return null;

  const data: Record<string, unknown> = {};
  if (masterPatch.title !== undefined) data.title = masterPatch.title.trim();
  if (masterPatch.description !== undefined) data.description = masterPatch.description;
  if (masterPatch.price !== undefined) data.price = masterPatch.price;
  if (masterPatch.category !== undefined) data.category = masterPatch.category;
  if (masterPatch.image !== undefined) data.image = masterPatch.image;
  if (masterPatch.active !== undefined) data.active = masterPatch.active;

  if (Object.keys(data).length === 0) {
    return productToMaster(existing);
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data,
    select: {
      title: true,
      description: true,
      price: true,
      category: true,
      image: true,
      active: true,
      posVisible: true,
      storefrontVisible: true,
    },
  });

  return productToMaster(updated);
}

/**
 * Update master menu item and optional channel overrides, then push to all channels.
 */
export async function updateMenuItem(
  workspaceId: string,
  productId: string,
  update: UniversalMenuItemUpdate,
): Promise<UniversalMenuUpdateResult> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const existingProduct = await loadProductForOwner(ownerUserId, productId);
  if (!existingProduct) throw new Error(`Product not found: ${productId}`);

  const previousMaster = productToMaster(existingProduct);
  const stored = (await getStoredUniversalMenuItem(ownerUserId, productId)) ?? {
    channelOverrides: {},
    syncStatus: {},
    syncHistory: [],
  };

  const master =
    update.master != null
      ? (await persistMasterUpdate(ownerUserId, productId, update.master)) ?? previousMaster
      : previousMaster;

  const channelOverrides = update.channelOverrides
    ? mergeChannelOverrides(stored.channelOverrides, update.channelOverrides)
    : mergeChannelOverrides(stored.channelOverrides, {});

  let pushOutcomes = [] as UniversalMenuUpdateResult["pushOutcomes"];
  let syncStatus = mergeSyncStatus(stored.syncStatus, {});

  const shouldPush = update.pushToChannels !== false;
  if (shouldPush) {
    pushOutcomes = await pushMenuItemToAllChannels({
      userId: ownerUserId,
      productId,
      master,
      previousMaster,
      channelOverrides,
    });
    syncStatus = applyPushOutcomesToSyncStatus(syncStatus, pushOutcomes);

    await appendUniversalMenuSyncHistory(
      ownerUserId,
      productId,
      pushOutcomes.map((o) => ({
        at: new Date().toISOString(),
        channel: o.channel,
        status: o.status,
        message: o.message,
      })),
    );
  } else {
    for (const channel of Object.keys(channelOverrides) as import("@/lib/menu/universal-menu-types").MenuChannel[]) {
      syncStatus[channel] = {
        ...syncStatus[channel],
        status: "pending",
        lastError: null,
      };
    }
  }

  await saveUniversalMenuItemStorage(ownerUserId, productId, {
    channelOverrides,
    syncStatus,
    syncHistory: stored.syncHistory,
  });

  const refreshed = await loadProductForOwner(ownerUserId, productId);
  const item = buildUniversalMenuItem({
    productId,
    menuId: existingProduct.menuId,
    master: refreshed ? productToMaster(refreshed) : master,
    stored: { channelOverrides, syncStatus, syncHistory: stored.syncHistory },
    updatedAt: refreshed?.updatedAt.toISOString() ?? new Date().toISOString(),
  });

  return { item, pushOutcomes };
}

/** Push an existing menu item to all channels without changing master data. */
export async function syncMenuItemToAllChannels(
  workspaceId: string,
  productId: string,
): Promise<UniversalMenuUpdateResult> {
  return updateMenuItem(workspaceId, productId, { pushToChannels: true });
}

export async function listUniversalMenuItemsForUser(
  userId: string,
  options?: { menuId?: string; search?: string; activeOnly?: boolean },
): Promise<UniversalMenuItem[]> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) throw new Error(`No workspace for user: ${userId}`);
  return listUniversalMenuItems(workspaceId, options);
}

export async function updateMenuItemForUser(
  userId: string,
  productId: string,
  update: UniversalMenuItemUpdate,
): Promise<UniversalMenuUpdateResult> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) throw new Error(`No workspace for user: ${userId}`);
  return updateMenuItem(workspaceId, productId, update);
}

function aggregateSyncHistory(
  items: UniversalMenuItem[],
  storage: Awaited<ReturnType<typeof loadUniversalMenuStorage>>,
): UniversalMenuDashboardPayload["syncHistory"] {
  const titleById = new Map(items.map((i) => [i.productId, i.master.title]));
  const entries: UniversalMenuDashboardPayload["syncHistory"] = [];

  for (const [productId, stored] of Object.entries(storage.items)) {
    for (const entry of stored.syncHistory ?? []) {
      entries.push({
        ...entry,
        productId,
        productTitle: titleById.get(productId) ?? "Unknown item",
      });
    }
  }

  return entries.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 80);
}

/** Server bundle for Universal Menu dashboard page. */
export async function loadUniversalMenuDashboard(
  workspaceId: string,
  options?: { menuId?: string; search?: string; activeOnly?: boolean },
): Promise<UniversalMenuDashboardPayload> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const [items, menus, storage] = await Promise.all([
    listUniversalMenuItems(workspaceId, options),
    prisma.menu.findMany({
      where: await menuListWhereForOwner(ownerUserId),
      select: { id: true, title: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      take: 50,
    }),
    loadUniversalMenuStorage(ownerUserId),
  ]);

  return {
    items,
    menus,
    syncHistory: aggregateSyncHistory(items, storage),
  };
}

/** Push all listed items to every channel. */
export async function syncAllMenuItems(
  workspaceId: string,
  productIds?: string[],
): Promise<SyncAllResult> {
  const ids =
    productIds ??
    (await listUniversalMenuItems(workspaceId)).map((item) => item.productId);

  const outcomes: SyncAllResult["outcomes"] = [];
  let synced = 0;
  let failed = 0;

  for (const productId of ids) {
    try {
      await syncMenuItemToAllChannels(workspaceId, productId);
      outcomes.push({ productId, ok: true });
      synced++;
    } catch (error) {
      failed++;
      outcomes.push({
        productId,
        ok: false,
        message: error instanceof Error ? error.message : "Sync failed",
      });
    }
  }

  return { synced, failed, outcomes };
}

/** Apply the same patch to multiple menu items (optional channel push). */
export async function bulkUpdateMenuItems(
  workspaceId: string,
  productIds: string[],
  patch: BulkMenuItemPatch,
  options?: { pushToChannels?: boolean },
): Promise<{ updated: number; items: UniversalMenuItem[] }> {
  const items: UniversalMenuItem[] = [];

  for (const productId of productIds) {
    const current = await getUniversalMenuItem(workspaceId, productId);
    if (!current) continue;

    const update: UniversalMenuItemUpdate = { pushToChannels: options?.pushToChannels ?? false };

    if (patch.priceDeltaPercent != null && patch.priceDeltaPercent !== 0) {
      const factor = 1 + patch.priceDeltaPercent / 100;
      update.master = {
        price: Math.round(current.master.price * factor * 100) / 100,
      };
    }

    if (patch.channel && patch.channelEnabled != null) {
      update.channelOverrides = {
        [patch.channel]: { enabled: patch.channelEnabled },
      };
    }

    const result = await updateMenuItem(workspaceId, productId, update);
    items.push(result.item);
  }

  return { updated: items.length, items };
}

/** Import CSV rows — updates master/overrides; push is optional second pass. */
export async function importUniversalMenuCsv(
  workspaceId: string,
  csvText: string,
  options?: { pushAfterImport?: boolean },
): Promise<ImportCsvResult> {
  const { rows, errors } = parseUniversalMenuCsv(csvText);
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const existing = await getUniversalMenuItem(workspaceId, row.productId);
    if (!existing) {
      skipped++;
      errors.push(`Product not found: ${row.productId}`);
      continue;
    }

    const update = csvRowToItemUpdate(row);
    if (options?.pushAfterImport) update.pushToChannels = true;
    await updateMenuItem(workspaceId, row.productId, update);
    imported++;
  }

  return { imported, skipped, errors };
}
