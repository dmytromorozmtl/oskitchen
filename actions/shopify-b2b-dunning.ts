"use server";

import { revalidatePath } from "next/cache";

import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireIntegrationsActor } from "@/lib/integrations/require-integrations-actor";
import { integrationConnectionByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  buildB2bOperatorDigestPreviewForConnection,
  runB2bDunningForConnection,
} from "@/services/integrations/shopify-b2b-dunning-service";
import type { B2bOperatorDigestPreview } from "@/lib/integrations/shopify-b2b-dunning-metadata";

export async function previewB2bDunningDigestAction(
  connectionId: string,
): Promise<ActionResult<B2bOperatorDigestPreview>> {
  try {
    const access = await requireIntegrationsActor({ operation: "shopify.b2b.dunning.preview" });
    if (!access.ok) return fail(access.error);
    const conn = await prisma.integrationConnection.findFirst({
      where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
      select: { id: true },
    });
    if (!conn) return fail("Shopify connection not found.");

    const preview = await buildB2bOperatorDigestPreviewForConnection({
      userId: access.actor.userId,
      connectionId,
    });
    if (!preview) return fail("B2B dunning is not enabled.");
    return ok(preview);
  } catch {
    return fail("Unable to load digest preview.");
  }
}

export async function runB2bDunningNowAction(
  connectionId: string,
  options?: { forceDigest?: boolean },
): Promise<
  ActionResult<{ digestSent: boolean; autoRemindersSent: number; skippedReason?: string }>
> {
  try {
    const access = await requireIntegrationsActor({ operation: "shopify.b2b.dunning.run" });
    if (!access.ok) return fail(access.error);
    const conn = await prisma.integrationConnection.findFirst({
      where: await integrationConnectionByIdWhereForOwner(access.actor.userId, connectionId),
      select: { id: true },
    });
    if (!conn) return fail("Shopify connection not found.");

    const result = await runB2bDunningForConnection({
      userId: access.actor.userId,
      workspaceId: access.actor.workspaceId,
      connectionId,
      forceDigest: options?.forceDigest,
    });

    revalidatePath("/dashboard/integrations/shopify");
    revalidatePath("/dashboard/order-hub");
    revalidatePath("/dashboard/storefront/markets");

    return ok({
      digestSent: result.digestSent,
      autoRemindersSent: result.autoRemindersSent,
      skippedReason: result.skippedReason,
    });
  } catch {
    return fail("Unable to run B2B dunning.");
  }
}

export async function runB2bDunningNowFormAction(formData: FormData): Promise<void> {
  const connectionId = String(formData.get("connectionId") ?? "").trim();
  if (!connectionId) return;
  const forceDigest = formData.get("forceDigest") === "1";
  await runB2bDunningNowAction(connectionId, { forceDigest });
}
