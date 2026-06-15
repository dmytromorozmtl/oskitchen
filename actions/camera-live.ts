"use server";

import { revalidatePath } from "next/cache";

import { fail, ok } from "@/lib/action-result";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { getCameraLiveDashboard } from "@/services/ai/camera-live-service";

const LIVE_PATH = "/dashboard/kitchen/cameras/live";

export async function refreshCameraLiveDashboardAction() {
  try {
    const { workspaceId } = await requireTenantActor();
    if (!workspaceId) return fail("Workspace required.");

    const dashboard = await getCameraLiveDashboard(workspaceId);
    revalidatePath(LIVE_PATH);
    revalidatePath("/dashboard/kitchen/cameras");
    return ok(dashboard);
  } catch (e) {
    return fail(safeError(e));
  }
}
