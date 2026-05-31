"use server";

import { IntegrationProvider } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireIntegrationsActor } from "@/lib/integrations/require-integrations-actor";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { DoorDashSyncService } from "@/services/integrations/doordash/order-sync.service";
import { syncMenuToDoorDash } from "@/services/integrations/doordash/doordash-service";
import { UberEatsMenuSyncService } from "@/services/integrations/uber-eats/menu-sync.service";
import type { UberEatsCredentials } from "@/services/integrations/uber-eats";

export async function forceUberEatsMenuSyncAction(): Promise<
  ActionResult<{ categoriesCount?: number; itemsCount?: number; message?: string }>
> {
  try {
    const gate = await requireIntegrationsActor({ operation: "integrations.force_uber_eats_menu_sync" });
    if (!gate.ok) return fail(gate.error);
    const { userId: dataUserId } = gate.actor;
    const where = await integrationConnectionByProviderWhereForOwner(
      dataUserId,
      IntegrationProvider.UBER_EATS,
    );
    const conn = await prisma.integrationConnection.findFirst({ where });
    if (!conn) return fail("Connect Uber Eats first.");

    const creds: UberEatsCredentials = {
      clientId: process.env.UBER_EATS_CLIENT_ID,
      clientSecret: process.env.UBER_EATS_CLIENT_SECRET,
      storeId: conn.externalStoreId,
    };
    const svc = new UberEatsMenuSyncService(creds);
    const result = await svc.pushMenu(dataUserId, conn.externalStoreId ?? "");
    revalidatePath("/dashboard/integrations/health");
    revalidatePath("/dashboard/integrations/uber-eats");
    return ok({
      categoriesCount: result.categoriesCount,
      itemsCount: result.itemsCount,
      message: result.message,
    });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function testDoorDashConnectionAction(): Promise<ActionResult<{ message: string }>> {
  try {
    const gate = await requireIntegrationsActor({ operation: "integrations.test_doordash_connection" });
    if (!gate.ok) return fail(gate.error);
    const { userId: dataUserId } = gate.actor;
    const svc = new DoorDashSyncService();
    const result = await svc.acceptOrder(`kitchenos-ping-${dataUserId.slice(0, 8)}`);
    revalidatePath("/dashboard/integrations/health");
    return ok({ message: result.message });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function forceDoorDashMenuSyncAction(): Promise<
  ActionResult<{ categoriesCount?: number; itemsCount?: number; message?: string }>
> {
  try {
    const gate = await requireIntegrationsActor({ operation: "integrations.doordash_menu_sync" });
    if (!gate.ok) return fail(gate.error);
    const { userId: dataUserId } = gate.actor;
    const result = await syncMenuToDoorDash(dataUserId);
    revalidatePath("/dashboard/integrations/health");
    revalidatePath("/dashboard/integrations/doordash");
    return ok({
      categoriesCount: result.categoriesCount,
      itemsCount: result.itemsCount,
      message: result.message,
    });
  } catch (e) {
    return fail(safeError(e));
  }
}
