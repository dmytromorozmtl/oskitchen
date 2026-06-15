import { prisma } from "@/lib/prisma";

/** Primary workspace for a kitchen owner (first created). */
export async function resolveOwnerWorkspaceId(ownerUserId: string): Promise<string | null> {
  const ws = await prisma.workspace.findFirst({
    where: { ownerUserId },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  return ws?.id ?? null;
}

/** Owner user id for a workspace — inverse of {@link resolveOwnerWorkspaceId}. */
export async function resolveWorkspaceOwnerUserId(workspaceId: string): Promise<string | null> {
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerUserId: true },
  });
  return ws?.ownerUserId ?? null;
}
