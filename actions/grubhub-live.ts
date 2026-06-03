"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  getGrubhubLiveDashboard,
  importGrubhubLiveOrders,
  saveGrubhubLiveCredentials,
  syncGrubhubLiveMenu,
  testGrubhubLiveConnection,
} from "@/services/integrations/grubhub-live-service";

const credentialsSchema = z.object({
  name: z.string().min(1).max(255),
  merchantId: z.string().min(1).max(120),
  apiKey: z.string().max(500).optional(),
  webhookSecret: z.string().max(500).optional(),
  menuSyncEnabled: z.union([z.boolean(), z.literal("on"), z.literal("off")]).optional(),
  orderIngestionEnabled: z.union([z.boolean(), z.literal("on"), z.literal("off")]).optional(),
});

export async function saveGrubhubLiveCredentialsAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("integrations.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const parsed = credentialsSchema.safeParse({
      name: String(formData.get("name") ?? "Grubhub"),
      merchantId: String(formData.get("merchantId") ?? ""),
      apiKey: String(formData.get("apiKey") ?? "") || undefined,
      webhookSecret: String(formData.get("webhookSecret") ?? "") || undefined,
      menuSyncEnabled: formData.get("menuSyncEnabled"),
      orderIngestionEnabled: formData.get("orderIngestionEnabled"),
    });
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid credentials.");
    }

    const result = await saveGrubhubLiveCredentials({
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

    revalidatePath("/dashboard/integrations/grubhub/live");
    revalidatePath("/dashboard/integrations/grubhub");
    return ok({ connectionId: result.connectionId });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function syncGrubhubLiveMenuAction() {
  try {
    const access = await requireMutationPermission("integrations.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const result = await syncGrubhubLiveMenu(dataUserId);
    if (!result.ok) return fail(result.message ?? "Menu sync failed.");

    revalidatePath("/dashboard/integrations/grubhub/live");
    return ok({ message: result.message ?? "Menu synced to Grubhub." });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function importGrubhubLiveOrdersAction() {
  try {
    const access = await requireMutationPermission("integrations.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const stats = await importGrubhubLiveOrders(dataUserId);

    revalidatePath("/dashboard/integrations/grubhub/live");
    revalidatePath("/dashboard/orders");
    return ok({
      message: `Imported ${stats.imported} of ${stats.total} Grubhub orders.`,
      ...stats,
    });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function testGrubhubLiveConnectionAction() {
  try {
    const access = await requireMutationPermission("integrations.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const result = await testGrubhubLiveConnection(dataUserId);
    return ok(result);
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function loadGrubhubLiveDashboardAction() {
  try {
    const { dataUserId } = await requireTenantActor();
    return ok(await getGrubhubLiveDashboard(dataUserId));
  } catch (e) {
    return fail(safeError(e));
  }
}
