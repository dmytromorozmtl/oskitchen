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
