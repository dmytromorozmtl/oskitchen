import { prisma } from "@/lib/prisma";
import { storefrontAssetListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export { isStorefrontMediaUploadConfigured } from "@/lib/storefront-builder/media-config";

export async function listStorefrontMediaForOwner(userId: string, storefrontId: string) {
  const assetScope = await storefrontAssetListWhereForOwner(userId);
  return prisma.storefrontAsset.findMany({
    where: { AND: [assetScope, { storefrontId }] },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}
