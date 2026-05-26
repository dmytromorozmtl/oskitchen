import { prisma } from "@/lib/prisma";

export async function listActiveWorkspaceTemplates() {
  return prisma.workspaceTemplate.findMany({
    where: { active: true },
    orderBy: { title: "asc" },
    take: 50,
    select: { id: true, key: true, title: true, category: true, version: true },
  });
}
