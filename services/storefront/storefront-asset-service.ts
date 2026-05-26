import { prisma } from "@/lib/prisma";
import { ownerScopedAnd } from "@/lib/scope/workspace-resource-scope";
import { getStorefrontStorageStatus } from "@/services/storefront/storefront-storage-service";

/**
 * Records a storefront asset after a successful provider upload (caller must perform upload separately).
 * When storage is not configured, callers should not invoke this — surface a setup-required state instead.
 */
export async function assertStorefrontAssetUploadAllowed(): Promise<{ ok: true } | { ok: false; reason: string }> {
  const s = getStorefrontStorageStatus();
  if (!s.ready) {
    return { ok: false, reason: "Storage provider is not configured. Choose Supabase Storage or S3-compatible storage." };
  }
  return { ok: true };
}

export async function listStorefrontAssetsForUser(userId: string) {
  const where = await ownerScopedAnd(userId, {});
  return prisma.storefrontAsset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
