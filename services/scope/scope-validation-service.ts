import { prisma } from "@/lib/prisma";

/** Returns true when `userId` owns the workspace row (ownerUserId). */
export async function userOwnsWorkspace(userId: string, workspaceId: string): Promise<boolean> {
  const ws = await prisma.workspace.findFirst({
    where: { id: workspaceId, ownerUserId: userId },
    select: { id: true },
  });
  return Boolean(ws);
}
