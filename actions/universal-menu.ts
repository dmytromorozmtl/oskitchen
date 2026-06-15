"use server";

import { revalidatePath } from "next/cache";

import type { BulkMenuItemPatch } from "@/lib/menu/universal-menu-dashboard-types";
import type { MenuChannel, UniversalMenuItemUpdate } from "@/lib/menu/universal-menu-types";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  bulkUpdateMenuItems,
  exportUniversalMenuCsv,
  importUniversalMenuCsv,
  listUniversalMenuItems,
  syncAllMenuItems,
  syncMenuItemToAllChannels,
  updateMenuItem,
} from "@/services/menu/universal-menu-engine";

function revalidateUniversalMenu() {
  revalidatePath("/dashboard/menu/universal");
}

export async function updateUniversalMenuItemAction(
  productId: string,
  update: UniversalMenuItemUpdate,
) {
  const { workspaceId } = await getTenantActor();
  if (!workspaceId) throw new Error("Workspace not found.");
  const result = await updateMenuItem(workspaceId, productId, update);
  revalidateUniversalMenu();
  return result;
}

export async function syncUniversalMenuItemAction(productId: string) {
  const { workspaceId } = await getTenantActor();
  if (!workspaceId) throw new Error("Workspace not found.");
  const result = await syncMenuItemToAllChannels(workspaceId, productId);
  revalidateUniversalMenu();
  return result;
}

export async function syncAllUniversalMenuAction(productIds?: string[]) {
  const { workspaceId } = await getTenantActor();
  if (!workspaceId) throw new Error("Workspace not found.");
  const result = await syncAllMenuItems(workspaceId, productIds);
  revalidateUniversalMenu();
  return result;
}

export async function bulkUpdateUniversalMenuAction(input: {
  productIds: string[];
  patch: BulkMenuItemPatch;
  pushToChannels?: boolean;
}) {
  const { workspaceId } = await getTenantActor();
  if (!workspaceId) throw new Error("Workspace not found.");
  const result = await bulkUpdateMenuItems(workspaceId, input.productIds, input.patch, {
    pushToChannels: input.pushToChannels,
  });
  revalidateUniversalMenu();
  return result;
}

export async function exportUniversalMenuCsvAction(options?: {
  menuId?: string;
  search?: string;
  activeOnly?: boolean;
}) {
  const { workspaceId } = await getTenantActor();
  if (!workspaceId) throw new Error("Workspace not found.");
  const items = await listUniversalMenuItems(workspaceId, options);
  return exportUniversalMenuCsv(items);
}

export async function importUniversalMenuCsvAction(formData: FormData) {
  const { workspaceId } = await getTenantActor();
  if (!workspaceId) throw new Error("Workspace not found.");

  const file = formData.get("file");
  const pushAfterImport = formData.get("pushAfterImport") === "true";
  if (!(file instanceof File)) throw new Error("CSV file is required.");

  const csvText = await file.text();
  const result = await importUniversalMenuCsv(workspaceId, csvText, { pushAfterImport });
  revalidateUniversalMenu();
  return result;
}

export async function filterUniversalMenuAction(input: {
  menuId?: string;
  search?: string;
  activeOnly?: boolean;
}) {
  const { workspaceId } = await getTenantActor();
  if (!workspaceId) throw new Error("Workspace not found.");
  return listUniversalMenuItems(workspaceId, input);
}

export type { MenuChannel };
