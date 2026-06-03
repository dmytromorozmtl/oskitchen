"use server";

import { revalidatePath } from "next/cache";

import { fail, ok } from "@/lib/action-result";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  contributeToNetworkEffects,
  loadNetworkEffectsDashboard,
} from "@/services/ai/network-effects-service";

const NETWORK_PATH = "/dashboard/analytics/network";

export async function refreshNetworkEffectsDashboardAction() {
  try {
    const { workspaceId } = await requireTenantActor();
    if (!workspaceId) return fail("Workspace required.");

    const dashboard = await loadNetworkEffectsDashboard(workspaceId);
    revalidatePath(NETWORK_PATH);
    revalidatePath("/dashboard/analytics/benchmarks");
    return ok(dashboard);
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function contributeNetworkEffectsAction() {
  try {
    const { workspaceId } = await requireTenantActor();
    if (!workspaceId) return fail("Workspace required.");

    const dashboard = await contributeToNetworkEffects(workspaceId);
    revalidatePath(NETWORK_PATH);
    revalidatePath("/dashboard/analytics/benchmarks");
    return ok({
      message: `Contributed ${dashboard.contribution.metricsShared} anonymized metrics. Thank you!`,
      dashboard,
    });
  } catch (e) {
    return fail(safeError(e));
  }
}
