import { endOfDay, startOfDay } from "date-fns";

import { MenuCenter, type MenuCenterRow } from "@/components/dashboard/menu-center";
import type { MenuBucket } from "@/components/dashboard/menu-center";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { parseCollectionStorefrontSettings } from "@/lib/storefront/collection-settings";
import { ensureCatalogMenu } from "@/lib/products/ensure-catalog-menu";
import {
  menuListWhereForOwnerAnd,
  orderListWhereForOwnerAnd,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { loadStorefrontMediaAssetsForUser } from "@/lib/storefront/load-media-assets-for-user";

export default async function MenusPage() {
  const { userId } = await requireTenantActor();
  await ensureCatalogMenu(userId);

  const menuWhere = await menuListWhereForOwnerAnd(userId, { catalogOnly: false });
  const [menus, storefront, kitchen] = await Promise.all([
    prisma.menu.findMany({
      where: menuWhere,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { products: true } },
      },
    }),
    prisma.storefrontSettings.findFirst({
      where: { userId },
      orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
      select: { activeMenuId: true, enabled: true, published: true, storeSlug: true },
    }),
    findOwnerKitchenSettings(userId, { businessType: true }),
  ]);

  const now = new Date();

  const rows: MenuCenterRow[] = await Promise.all(
    menus.map(async (m) => {
      const orderCount = await prisma.order.count({
        where: await orderListWhereForOwnerAnd(userId, {
          orderItems: { some: { product: { menuId: m.id } } },
        }),
      });

      const start = startOfDay(m.startDate);
      const end = endOfDay(m.endDate);

      let status: "active" | "draft" | "closed";
      if (now > end) status = "closed";
      else if (m.active) status = "active";
      else status = "draft";

      let bucket: MenuBucket;
      if (now > end) bucket = "archived";
      else if (m.active) bucket = "active";
      else if (now < start) bucket = "scheduled";
      else bucket = "draft";

      return {
        id: m.id,
        title: m.title,
        strategy: m.strategy,
        description: m.description,
        startDate: m.startDate.toISOString(),
        endDate: m.endDate.toISOString(),
        preorderDeadline: m.preorderDeadline.toISOString(),
        active: m.active,
        published: m.published,
        productCount: m._count.products,
        orderCount,
        status,
        bucket,
        storefrontLinked: storefront?.activeMenuId === m.id,
        collectionSlug: m.collectionSlug,
        collectionHero: parseCollectionStorefrontSettings(m.storefrontSettingsJson),
      };
    }),
  );

  const mediaAssets = await loadStorefrontMediaAssetsForUser(userId);

  return (
    <MenuCenter
      businessType={kitchen?.businessType ?? null}
      initialMenus={rows}
      storefrontSurface={{
        activeMenuId: storefront?.activeMenuId ?? null,
        storefrontEnabled: storefront?.enabled ?? false,
        storefrontPublished: storefront?.published ?? false,
      }}
      storeSlug={storefront?.storeSlug ?? null}
      mediaAssets={mediaAssets}
    />
  );
}
