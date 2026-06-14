import {
  buildInventoryManagerSnapshot,
  buildShrinkageSignals,
  buildTheftSignals,
  buildWasteSignals,
} from "@/lib/ai/inventory-manager-builders";
import { AI_INVENTORY_MANAGER_WINDOW_DAYS } from "@/lib/ai/inventory-manager-policy";
import type { InventoryManagerSnapshot } from "@/lib/ai/inventory-manager-types";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { listTheftDetectionAlerts } from "@/services/costing/costing-alert-service";
import { listInventoryCountRows } from "@/services/inventory/count-service";
import { getWasteSummary } from "@/services/inventory/waste-service";

export type {
  InventoryManagerDailyBrief,
  InventoryManagerSnapshot,
  ShrinkageSignal,
  TheftSignal,
  WasteSignal,
} from "@/lib/ai/inventory-manager-types";

export async function loadInventoryManagerSnapshot(userId: string): Promise<InventoryManagerSnapshot> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) {
    throw new Error(`No workspace for user: ${userId}`);
  }

  const [waste, theftAlerts, countRows] = await Promise.all([
    getWasteSummary(userId, AI_INVENTORY_MANAGER_WINDOW_DAYS),
    listTheftDetectionAlerts(userId),
    listInventoryCountRows(userId, 20),
  ]);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - AI_INVENTORY_MANAGER_WINDOW_DAYS);

  const recentCounts = countRows.filter(
    (count) => count.status === "COMPLETED" && count.createdAt >= cutoff,
  );

  return buildInventoryManagerSnapshot({
    workspaceId,
    wasteSignals: buildWasteSignals(waste.byReason),
    theftSignals: buildTheftSignals(theftAlerts),
    shrinkageSignals: buildShrinkageSignals(recentCounts),
  });
}

export async function loadInventoryManagerSnapshotForWorkspace(
  workspaceId: string,
): Promise<InventoryManagerSnapshot> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }
  return loadInventoryManagerSnapshot(ownerUserId);
}
