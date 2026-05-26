/**
 * Reproduce /dashboard/menus server render for an owner email.
 *   npx tsx scripts/debug-menus-page.ts workspace.moroz@gmail.com
 */
import { endOfDay, startOfDay } from "date-fns";

import type { MenuBucket } from "@/components/dashboard/menu-center";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";
import { parseCollectionStorefrontSettings } from "@/lib/storefront/collection-settings";
import { ensureCatalogMenu } from "@/lib/products/ensure-catalog-menu";
import {
  menuListWhereForOwnerAnd,
  orderListWhereForOwnerAnd,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { loadStorefrontMediaAssetsForUser } from "@/lib/storefront/load-media-assets-for-user";

async function main() {
  const email = process.argv[2]?.trim() || "workspace.moroz@gmail.com";
  const user = await prisma.userProfile.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    console.error("No user for", email);
    process.exit(1);
  }
  const dataUserId = user.id;
  console.log("dataUserId", dataUserId);

  await ensureCatalogMenu(dataUserId);
  const menuWhere = await menuListWhereForOwnerAnd(dataUserId, { catalogOnly: false });
  const menus = await prisma.menu.findMany({
    where: menuWhere,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { products: true } } },
  });
  console.log("menus", menus.length);

  const now = new Date();
  for (const m of menus) {
    try {
      await prisma.order.count({
        where: await orderListWhereForOwnerAnd(dataUserId, {
          orderItems: { some: { product: { menuId: m.id } } },
        }),
      });
      parseCollectionStorefrontSettings(m.storefrontSettingsJson);
      startOfDay(m.startDate);
      endOfDay(m.endDate);
      console.log("OK menu", m.id, m.title);
    } catch (e) {
      console.error("FAIL menu", m.id, m.title, e);
      process.exit(1);
    }
  }

  await loadStorefrontMediaAssetsForUser(dataUserId);
  await findOwnerKitchenSettings(dataUserId, { businessType: true });
  console.log("All menus page data paths OK");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
