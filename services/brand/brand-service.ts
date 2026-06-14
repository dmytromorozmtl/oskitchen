import { prisma } from "@/lib/prisma";

export async function listBrandsForUser(userId: string) {
  const workspace = await prisma.workspace.findFirst({
    where: { OR: [{ ownerUserId: userId }, { members: { some: { userId } } }] },
    select: { id: true },
  });
  if (!workspace) return [];
  return prisma.brand.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { name: "asc" },
  });
}
