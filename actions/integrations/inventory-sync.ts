"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { Prisma } from "@prisma/client";

import { requireIntegrationsActor } from "@/lib/integrations/require-integrations-actor";
import {
  mergeInventorySyncIntoConnectionSettings,
  parseInventorySyncSettings,
} from "@/lib/integrations/inventory-sync-settings";
import { prisma } from "@/lib/prisma";
import { integrationConnectionByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import {
  listStoredInventoryConflicts,
  runInventorySyncPull,
  runInventorySyncPush,
} from "@/services/integrations/inventory-sync-load";

const INVENTORY_SYNC_PATH = "/dashboard/integrations/inventory-sync";

function revalidateInventorySync() {
  revalidatePath(INVENTORY_SYNC_PATH);
  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/integrations/woocommerce");
}

export async function pullInventorySyncAction(): Promise<void> {
  const gate = await requireIntegrationsActor({ operation: "integrations.inventory_sync_pull" });
  if (!gate.ok) throw new Error(gate.error);
  await runInventorySyncPull(gate.actor.userId);
  revalidateInventorySync();
}

export async function resolveInventoryConflictAction(formData: FormData): Promise<void> {
  const gate = await requireIntegrationsActor({ operation: "integrations.inventory_sync_resolve" });
  if (!gate.ok) throw new Error(gate.error);

  const connectionId = z.string().uuid().parse(formData.get("connectionId"));
  const conflictId = z.string().min(1).parse(formData.get("conflictId"));
  const strategy = z.enum(["kitchen_wins", "channel_wins"]).parse(formData.get("strategy"));

  const result = await runInventorySyncPush(gate.actor.userId, connectionId, strategy, conflictId);
  if (!result.ok) throw new Error(result.message);
  revalidateInventorySync();
}

export async function pushAllInventorySyncAction(formData: FormData): Promise<void> {
  const gate = await requireIntegrationsActor({ operation: "integrations.inventory_sync_push" });
  if (!gate.ok) throw new Error(gate.error);

  const connectionId = z.string().uuid().parse(formData.get("connectionId"));
  const strategy = z.enum(["kitchen_wins", "channel_wins"]).parse(formData.get("strategy"));

  const result = await runInventorySyncPush(gate.actor.userId, connectionId, strategy);
  if (!result.ok) throw new Error(result.message);
  revalidateInventorySync();
}

export async function saveInventorySyncSettingsAction(formData: FormData): Promise<void> {
  const gate = await requireIntegrationsActor({ operation: "integrations.inventory_sync_settings" });
  if (!gate.ok) throw new Error(gate.error);

  const connectionId = z.string().uuid().parse(formData.get("connectionId"));
  const settings = parseInventorySyncSettings({
    enabled: formData.get("enabled") === "on",
    conflictResolution: formData.get("conflictResolution"),
    autoPushOnPull: formData.get("autoPushOnPull") === "on",
  });

  const where = await integrationConnectionByIdWhereForOwner(gate.actor.userId, connectionId);
  const conn = await prisma.integrationConnection.findFirst({ where, select: { settingsJson: true } });
  if (!conn) throw new Error("Connection not found");

  await prisma.integrationConnection.update({
    where: { id: connectionId },
    data: {
      settingsJson: mergeInventorySyncIntoConnectionSettings(
        conn.settingsJson,
        settings,
      ) as Prisma.InputJsonValue,
    },
  });
  revalidateInventorySync();
}

export async function getInventorySyncConflictsAction(): Promise<
  Awaited<ReturnType<typeof listStoredInventoryConflicts>>
> {
  const gate = await requireIntegrationsActor({ operation: "integrations.inventory_sync_list" });
  if (!gate.ok) throw new Error(gate.error);
  return listStoredInventoryConflicts(gate.actor.userId);
}
