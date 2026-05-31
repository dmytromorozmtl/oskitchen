"use server";

import { revalidatePath } from "next/cache";

import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { B2bArCollectorTaskStatus } from "@/lib/integrations/shopify-b2b-collector-queue-metadata";
import { IntegrationProvider } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  runB2bCollectorDigestForConnection,
  setB2bCollectorSlaForCompany,
  updateB2bCollectorTaskStatus,
} from "@/services/integrations/shopify-b2b-collector-queue-service";

async function resolveShopifyConnectionId(userId: string): Promise<string | null> {
  const conn = await prisma.integrationConnection.findFirst({
    where: { userId, provider: IntegrationProvider.SHOPIFY },
    select: { id: true },
  });
  return conn?.id ?? null;
}

export async function updateB2bCollectorTaskStatusAction(input: {
  taskId: string;
  status: B2bArCollectorTaskStatus;
  notes?: string | null;
}): Promise<ActionResult<{ updated: boolean }>> {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return fail(access.error);

    const connectionId = await resolveShopifyConnectionId(access.actor.userId);
    if (!connectionId) return fail("Connect Shopify before managing collector tasks.");

    const result = await updateB2bCollectorTaskStatus({
      userId: access.actor.userId,
      connectionId,
      taskId: input.taskId,
      status: input.status,
      notes: input.notes,
    });
    if (!result.ok) return fail("Unable to update collector task.");

    revalidatePath("/dashboard/receivables");
    revalidatePath("/dashboard/integrations/shopify");
    return ok({ updated: true });
  } catch {
    return fail("Unable to update collector task.");
  }
}

export async function setB2bCollectorSlaAction(
  companyAccountId: string,
  slaDays: number,
): Promise<ActionResult<{ saved: boolean }>> {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return fail(access.error);

    const connectionId = await resolveShopifyConnectionId(access.actor.userId);
    if (!connectionId) return fail("Connect Shopify before setting collector SLA.");

    const result = await setB2bCollectorSlaForCompany({
      userId: access.actor.userId,
      connectionId,
      companyAccountId,
      slaDays,
    });
    if (!result.ok) return fail("Unable to save SLA.");

    revalidatePath("/dashboard/receivables");
    return ok({ saved: true });
  } catch {
    return fail("Unable to save SLA.");
  }
}

export async function runB2bCollectorDigestNowFormAction(formData: FormData): Promise<void> {
  const access = await requireMutationPermission("orders.manage");
  if (!access.ok) return;

  const connectionId = String(formData.get("connectionId") ?? "");
  if (!connectionId) return;

  await runB2bCollectorDigestForConnection({
    userId: access.actor.userId,
    workspaceId: access.actor.workspaceId,
    connectionId,
    forceDigest: formData.get("forceDigest") === "1",
  }).catch(() => undefined);

  revalidatePath("/dashboard/integrations/shopify");
  revalidatePath("/dashboard/receivables");
}
