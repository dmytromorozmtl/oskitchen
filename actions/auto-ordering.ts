"use server";

import { revalidatePath } from "next/cache";

import { fail, ok } from "@/lib/action-result";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import type { AutoOrderingSettings } from "@/lib/inventory/auto-ordering-types";
import {
  loadAutoOrderingDashboard,
  runAutoOrderingBatch,
  updateAutoOrderingSettings,
} from "@/services/inventory/auto-ordering-service";

const AUTO_ORDERING_PATH = "/dashboard/inventory/auto-ordering";

const REVALIDATE_PATHS = [
  AUTO_ORDERING_PATH,
  "/dashboard/inventory/purchasing-ai",
  "/dashboard/purchasing",
  "/dashboard/purchasing/purchase-orders",
];

function revalidateAll() {
  for (const path of REVALIDATE_PATHS) revalidatePath(path);
}

export async function refreshAutoOrderingDashboardAction() {
  try {
    const { workspaceId } = await requireTenantActor();
    if (!workspaceId) return fail("Workspace required.");

    const dashboard = await loadAutoOrderingDashboard(workspaceId);
    revalidateAll();
    return ok(dashboard);
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function updateAutoOrderingSettingsAction(patch: Partial<AutoOrderingSettings>) {
  try {
    const { workspaceId } = await requireTenantActor();
    if (!workspaceId) return fail("Workspace required.");

    const settings = await updateAutoOrderingSettings(workspaceId, patch);
    revalidateAll();
    return ok({ settings, message: "Auto-ordering settings saved." });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function runAutoOrderingBatchAction(options?: { dryRun?: boolean }) {
  try {
    const { workspaceId, userId } = await requireTenantActor();
    if (!workspaceId || !userId) return fail("Workspace required.");

    const result = await runAutoOrderingBatch({
      workspaceId,
      performedByUserId: userId,
      dryRun: options?.dryRun ?? false,
    });

    revalidateAll();

    if (result.errors.length > 0 && result.ordersCreated === 0) {
      return fail(result.errors.join(" "));
    }

    return ok({
      result,
      message: options?.dryRun
        ? `Dry run: would create ${result.ordersCreated} PO(s) from ${result.proposalCount} proposals.`
        : `Created ${result.ordersCreated} purchase order(s).`,
    });
  } catch (e) {
    return fail(safeError(e));
  }
}
