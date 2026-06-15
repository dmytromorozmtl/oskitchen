import { prisma } from "@/lib/prisma";

import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

/**
 * Guarantees a workspace row exists for a kitchen owner before tenant writes
 * (billing events, POS registers, etc.) after workspace_id NOT NULL on prod.
 */
export async function ensureOwnerWorkspaceId(ownerUserId: string): Promise<string> {
  const existing = await resolveOwnerWorkspaceId(ownerUserId);
  if (existing) return existing;

  const [profile, kitchen] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: ownerUserId },
      select: { email: true, companyName: true },
    }),
    prisma.kitchenSettings.findUnique({
      where: { userId: ownerUserId },
      select: { businessName: true, timezone: true, currency: true },
    }),
  ]);

  const name =
    kitchen?.businessName?.trim() ||
    profile?.companyName?.trim() ||
    profile?.email?.split("@")[0] ||
    "Kitchen workspace";

  const workspace = await prisma.workspace.create({
    data: {
      ownerUserId,
      name: name.slice(0, 255),
      timezone: kitchen?.timezone?.trim() || "UTC",
      currency: kitchen?.currency?.trim() || "USD",
    },
    select: { id: true },
  });

  await prisma.kitchenSettings
    .updateMany({
      where: { userId: ownerUserId, workspaceId: null },
      data: { workspaceId: workspace.id },
    })
    .catch(() => undefined);

  return workspace.id;
}
