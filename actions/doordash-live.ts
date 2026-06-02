"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  getDoorDashLiveDashboard,
  importDoorDashLiveOrders,
  saveDoorDashLiveCredentials,
  syncDoorDashLiveMenu,
  testDoorDashLiveConnection,
} from "@/services/integrations/doordash-live-service";

const credentialsSchema = z.object({
  name: z.string().min(1).max(255),
  merchantId: z.string().min(1).max(120),
  apiKey: z.string().max(500).optional(),
  webhookSecret: z.string().max(500).optional(),
  menuSyncEnabled: z.union([z.boolean(), z.literal("on")]).optional(),
  orderIngestionEnabled: z.union([z.boolean(), z.literal("on")]).optional(),
});

export async function saveDoorDashLiveCredentialsAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("integrations.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const parsed = credentialsSchema.safeParse({
      name: String(formData.get("name") ?? "DoorDash"),
      merchantId: String(formData.get("merchantId") ?? ""),
      apiKey: String(formData.get("apiKey") ?? "") || undefined,
      webhookSecret: String(formData.get("webhookSecret") ?? "") || undefined,
      menuSyncEnabled: formData.get("menuSyncEnabled"),
      orderIngestionEnabled: formData.get("orderIngestionEnabled"),
    });
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid credentials.");
    }

    const result = await saveDoorDashLiveCredentials({
      userId: dataUserId,
      name: parsed.data.name,
      merchantId: parsed.data.merchantId,
      apiKey: parsed.data.apiKey,
      webhookSecret: parsed.data.webhookSecret,
      menuSyncEnabled:
        parsed.data.menuSyncEnabled === true || parsed.data.menuSyncEnabled === "on",
      orderIngestionEnabled:
        parsed.data.orderIngestionEnabled !== false && parsed.data.orderIngestionEnabled !== "off",
    });
    if (!result.ok) return fail(result.error);

    revalidatePath("/dashboard/integrations/doordash/live");
    revalidatePath("/dashboard/integrations/doordash");
    return ok({ connectionId: result.connectionId });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function syncDoorDashLiveMenuAction() {
  try {
    const access = await requireMutationPermission("integrations.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const result = await syncDoorDashLiveMenu(dataUserId);
    if (!result.ok) return fail(result.message ?? "Menu sync failed.");

    revalidatePath("/dashboard/integrations/doordash/live");
    return ok({ message: result.message ?? "Menu synced to DoorDash." });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function importDoorDashLiveOrdersAction() {
  try {
    const access = await requireMutationPermission("integrations.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const stats = await importDoorDashLiveOrders(dataUserId);

    revalidatePath("/dashboard/integrations/doordash/live");
    revalidatePath("/dashboard/orders");
    return ok({
      message: `Imported ${stats.imported} of ${stats.total} DoorDash orders.`,
      ...stats,
    });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function testDoorDashLiveConnectionAction() {
  try {
    const access = await requireMutationPermission("integrations.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const result = await testDoorDashLiveConnection(dataUserId);
    return ok(result);
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function loadDoorDashLiveDashboardAction() {
  try {
    const { dataUserId } = await requireTenantActor();
    return ok(await getDoorDashLiveDashboard(dataUserId));
  } catch (e) {
    return fail(safeError(e));
  }
}
