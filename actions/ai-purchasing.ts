"use server";

import { revalidatePath } from "next/cache";

import { loadAiPurchasingUiState, saveAiPurchasingUiState } from "@/lib/ai/ai-purchasing-ui-storage";
import { requireSessionUser } from "@/lib/auth";
import { createPurchaseOrdersFromAiLines } from "@/services/ai/ai-purchasing-orders";
import { loadPurchasingAiDashboard } from "@/services/ai/ai-purchasing-dashboard";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

const REVALIDATE_PATHS = [
  "/dashboard/inventory/purchasing-ai",
  "/dashboard/purchasing",
  "/dashboard/purchasing/purchase-orders",
];

function revalidatePurchasing() {
  for (const path of REVALIDATE_PATHS) revalidatePath(path);
}

async function workspaceContext() {
  const user = await requireSessionUser();
  const workspaceId = await resolveOwnerWorkspaceId(user.id);
  if (!workspaceId) throw new Error("Workspace required.");
  return { user, workspaceId };
}

function lineFromRow(
  row: Awaited<ReturnType<typeof loadPurchasingAiDashboard>>["activeRows"][number],
) {
  return {
    ingredientId: row.ingredientId,
    ingredientName: row.ingredientName,
    quantity: row.orderQuantity,
    unit: row.unit,
    unitCost: row.bestSupplier.unitCost,
    supplierId: row.bestSupplier.supplierId,
    supplierName: row.bestSupplier.supplierName,
    supplierItemId: row.bestSupplier.supplierItemId,
  };
}

export async function orderAiPurchaseItemAction(ingredientId: string) {
  try {
    const { user, workspaceId } = await workspaceContext();
    const dash = await loadPurchasingAiDashboard(workspaceId);
    const row = dash.activeRows.find((r) => r.ingredientId === ingredientId);
    if (!row) return { error: "Recommendation not found or skipped." };

    const result = await createPurchaseOrdersFromAiLines(user.id, user.id, [lineFromRow(row)]);
    revalidatePurchasing();

    if (result.poIds.length === 0) {
      return { error: result.errors[0] ?? "Could not create purchase order." };
    }
    return { ok: true as const, poId: result.poIds[0]!, warnings: result.errors };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Order failed." };
  }
}

export async function orderAllAiPurchasesAction() {
  try {
    const { user, workspaceId } = await workspaceContext();
    const dash = await loadPurchasingAiDashboard(workspaceId);
    if (dash.activeRows.length === 0) return { error: "No active recommendations to order." };

    const result = await createPurchaseOrdersFromAiLines(
      user.id,
      user.id,
      dash.activeRows.map(lineFromRow),
    );
    revalidatePurchasing();

    if (result.poIds.length === 0) {
      return { error: result.errors[0] ?? "Could not create purchase orders." };
    }
    return {
      ok: true as const,
      poIds: result.poIds,
      count: dash.activeRows.length,
      warnings: result.errors,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Order all failed." };
  }
}

export async function skipAiPurchaseItemAction(ingredientId: string, reason: string) {
  try {
    const { user } = await workspaceContext();
    const trimmed = reason.trim();
    if (!trimmed) return { error: "Skip reason is required." };

    const state = await loadAiPurchasingUiState(user.id);
    state.skipped[ingredientId] = { reason: trimmed, skippedAt: new Date().toISOString() };
    await saveAiPurchasingUiState(user.id, state);
    revalidatePurchasing();
    return { ok: true as const };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Skip failed." };
  }
}

export async function unskipAiPurchaseItemAction(ingredientId: string) {
  try {
    const { user } = await workspaceContext();
    const state = await loadAiPurchasingUiState(user.id);
    delete state.skipped[ingredientId];
    await saveAiPurchasingUiState(user.id, state);
    revalidatePurchasing();
    return { ok: true as const };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Restore failed." };
  }
}

export async function adjustAiPurchaseQuantityAction(ingredientId: string, quantity: number) {
  try {
    const { user } = await workspaceContext();
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { error: "Quantity must be greater than zero." };
    }

    const state = await loadAiPurchasingUiState(user.id);
    state.quantityOverrides[ingredientId] = Math.round(quantity * 10) / 10;
    await saveAiPurchasingUiState(user.id, state);
    revalidatePurchasing();
    return { ok: true as const };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Update failed." };
  }
}
