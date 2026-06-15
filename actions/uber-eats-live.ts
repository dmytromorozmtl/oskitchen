"use server";

import { revalidatePath } from "next/cache";

import { fail, ok } from "@/lib/action-result";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  ensureUberEatsConnection,
  getUberEatsLiveDashboard,
  importUberEatsLiveOrders,
  syncUberEatsLiveMenu,
  testUberEatsLiveConnection,
} from "@/services/integrations/uber-eats-live-service";

export async function loadUberEatsLiveDashboardAction() {
  try {
    const { dataUserId } = await requireTenantActor();
    const dashboard = await getUberEatsLiveDashboard(dataUserId);
    return ok(dashboard);
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function syncUberEatsLiveMenuAction() {
  try {
    const access = await requireMutationPermission("integrations.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const result = await syncUberEatsLiveMenu(dataUserId);
    if (!result.ok) return fail(result.message ?? "Menu sync failed.");

    revalidatePath("/dashboard/integrations/uber-eats/live");
    revalidatePath("/dashboard/integrations/uber-eats");
    return ok({ message: result.message ?? "Menu synced to Uber Eats." });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function importUberEatsLiveOrdersAction() {
  try {
    const access = await requireMutationPermission("integrations.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const stats = await importUberEatsLiveOrders(dataUserId);

    revalidatePath("/dashboard/integrations/uber-eats/live");
    revalidatePath("/dashboard/orders");
    return ok({
      message: `Imported ${stats.imported} of ${stats.total} Uber Eats orders.`,
      ...stats,
    });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function testUberEatsLiveConnectionAction() {
  try {
    const access = await requireMutationPermission("integrations.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    await ensureUberEatsConnection(dataUserId);
    const result = await testUberEatsLiveConnection(dataUserId);
    return ok(result);
  } catch (e) {
    return fail(safeError(e));
  }
}
