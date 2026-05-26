import { prisma } from "@/lib/prisma";
import type { ProductMediaAsset } from "@/lib/menus/product-image-fields";
import { listStorefrontMediaForOwner } from "@/services/storefront-builder/media-service";

/** Storefront media library assets for dashboard pickers (menus, products, theme). */
export async function loadStorefrontMediaAssetsForUser(userId: string): Promise<ProductMediaAsset[]> {
  const sf = await prisma.storefrontSettings.findFirst({ where: { userId  }, orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    select: { id: true },
  });
  if (!sf) return [];
  return (await listStorefrontMediaForOwner(userId, sf.id)).map((a) => ({
    id: a.id,
    url: a.url,
    label: a.label,
    altText: a.altText,
  }));
}
