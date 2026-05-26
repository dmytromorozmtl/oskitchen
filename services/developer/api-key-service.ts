import { apiKeyListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export async function listApiKeysForDeveloper(userId: string) {
  return prisma.apiKey.findMany({
    where: await apiKeyListWhereForOwner(userId),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      prefix: true,
      active: true,
      createdAt: true,
      lastUsedAt: true,
      revokedAt: true,
    },
  });
}

export async function countActiveApiKeys(userId: string): Promise<number> {
  return prisma.apiKey.count({
    where: { AND: [await apiKeyListWhereForOwner(userId), { active: true }] },
  });
}
