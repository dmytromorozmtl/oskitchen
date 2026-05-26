import { prisma } from "@/lib/prisma";

/**
 * SaaS billing remains on the workspace owner's UserProfile (Stripe customer).
 * Staff sessions pass their own userId; billing resolves to owner when workspaceId is known.
 */
export async function resolveBillingUserId(
  sessionUserId: string,
  workspaceId?: string | null,
): Promise<string> {
  if (!workspaceId?.trim()) {
    return sessionUserId;
  }
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId.trim() },
    select: { ownerUserId: true },
  });
  return ws?.ownerUserId ?? sessionUserId;
}

/** Attach workspaceId to subscription row when first created under a workspace context. */
export async function linkSubscriptionWorkspace(
  billingUserId: string,
  workspaceId: string | null | undefined,
): Promise<void> {
  if (!workspaceId?.trim()) return;
  await prisma.subscription.updateMany({
    where: { userId: billingUserId, workspaceId: null },
    data: { workspaceId: workspaceId.trim() },
  });
}
