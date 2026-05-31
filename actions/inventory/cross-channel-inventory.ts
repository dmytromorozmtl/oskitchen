"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { Prisma } from "@prisma/client";

import {
  crossChannelSettingsFromConnection,
  mergeCrossChannelIntoConnectionSettings,
  parseCrossChannelInventorySettings,
} from "@/lib/inventory/cross-channel-inventory-settings";
import { requireIntegrationsActor } from "@/lib/integrations/require-integrations-actor";
import { prisma } from "@/lib/prisma";
import { integrationConnectionByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import {
  runCrossChannelInventorySyncPull,
  runCrossChannelInventorySyncPush,
} from "@/services/inventory/cross-channel-inventory-sync";

const CROSS_CHANNEL_INVENTORY_PATH = "/dashboard/inventory/cross-channel";

function revalidateCrossChannelInventory() {
  revalidatePath(CROSS_CHANNEL_INVENTORY_PATH);
  revalidatePath("/dashboard/integrations/inventory-sync");
}

export async function pullCrossChannelInventoryAction(): Promise<void> {
  const gate = await requireIntegrationsActor({
    operation: "inventory.cross_channel_pull",
  });
  if (!gate.ok) throw new Error(gate.error);
  await runCrossChannelInventorySyncPull(gate.actor.userId);
  revalidateCrossChannelInventory();
}

export async function resolveCrossChannelConflictAction(formData: FormData): Promise<void> {
  const gate = await requireIntegrationsActor({
    operation: "inventory.cross_channel_resolve",
  });
  if (!gate.ok) throw new Error(gate.error);

  const connectionId = z.string().uuid().parse(formData.get("connectionId"));
  const conflictId = z.string().min(1).parse(formData.get("conflictId"));
  const strategy = z.enum(["kitchen_wins", "channel_wins"]).parse(formData.get("strategy"));

  const result = await runCrossChannelInventorySyncPush(
    gate.actor.userId,
    connectionId,
    strategy,
    conflictId,
  );
  if (!result.ok) throw new Error(result.message);
  revalidateCrossChannelInventory();
}

export async function pushCrossChannelInventoryAction(formData: FormData): Promise<void> {
  const gate = await requireIntegrationsActor({
    operation: "inventory.cross_channel_push",
  });
  if (!gate.ok) throw new Error(gate.error);

  const connectionId = z.string().uuid().parse(formData.get("connectionId"));
  const strategy = z.enum(["kitchen_wins", "channel_wins"]).parse(formData.get("strategy"));

  const result = await runCrossChannelInventorySyncPush(
    gate.actor.userId,
    connectionId,
    strategy,
  );
  if (!result.ok) throw new Error(result.message);
  revalidateCrossChannelInventory();
}

export async function saveCrossChannelInventorySettingsAction(formData: FormData): Promise<void> {
  const gate = await requireIntegrationsActor({
    operation: "inventory.cross_channel_settings",
  });
  if (!gate.ok) throw new Error(gate.error);

  const connectionId = z.string().uuid().parse(formData.get("connectionId"));
  const settings = parseCrossChannelInventorySettings({
    enabled: formData.get("enabled") === "on",
    conflictResolution: formData.get("conflictResolution"),
    autoPushOnChange: formData.get("autoPushOnChange") === "on",
    lowStockThreshold: Number(formData.get("lowStockThreshold") ?? 5),
  });

  const where = await integrationConnectionByIdWhereForOwner(gate.actor.userId, connectionId);
  const conn = await prisma.integrationConnection.findFirst({
    where,
    select: { settingsJson: true },
  });
  if (!conn) throw new Error("Connection not found");

  await prisma.integrationConnection.update({
    where: { id: connectionId },
    data: {
      settingsJson: mergeCrossChannelIntoConnectionSettings(
        conn.settingsJson,
        settings,
      ) as Prisma.InputJsonValue,
    },
  });
  revalidateCrossChannelInventory();
}
