import { prisma } from "@/lib/prisma";
import { storefrontAssetListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function listStorefrontMediaForOwner(userId: string, storefrontId: string) {
  const scope = await storefrontAssetListWhereForOwner(userId);
  return prisma.storefrontAsset.findMany({
    where: {
      AND: [scope, { storefrontId }],
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}
