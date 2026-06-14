import { prisma } from "@/lib/prisma";

export async function listBrandsForWorkspace(workspaceId: string) {
  return prisma.brand.findMany({
    where: { workspaceId },
    select: { id: true, name: true, slug: true, locationId: true, lifecycleStatus: true },
    orderBy: { name: "asc" },
  });
}

export async function countBrandsForWorkspace(workspaceId: string): Promise<number> {
  return prisma.brand.count({ where: { workspaceId } });
}
