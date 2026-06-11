/**
 * Commercial launch demo extras — extends `seedDemoWorkspace` to hit launch checklist:
 * 30 products, 50 orders, 3 vendors, 20 inventory items, 5 staff, storefront.
 */
import {
  ProductCategory,
  ProductionBatchStatus,
  ProductionCommandMode,
} from "@prisma/client";

import type { DemoVerticalSlug } from "@/lib/demo-verticals";
import { prisma } from "@/lib/prisma";
import {
  menuListWhereForOwnerAnd,
  productionBatchListWhereForOwner,
  staffMemberListWhereForOwner,
  storefrontSettingsListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { seedDemoWorkspace } from "@/services/demo-data";
import { seedDemoTenantBlueprintExtras } from "@/services/demo/demo-tenant-seed";

const DEMO_IMG =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";

const EXTRA_PRODUCT_TITLES = [
  "Classic Burger",
  "Caesar Salad",
  "Margherita Pizza",
  "French Fries",
  "Coca Cola",
  "Grilled Salmon",
  "Chicken Wings",
  "Tomato Soup",
  "Iced Tea",
  "Chocolate Cake",
  "Fish Tacos",
  "Veggie Bowl",
  "Espresso",
  "Onion Rings",
  "Pasta Alfredo",
  "House Wine",
  "Brunch Plate",
  "Kids Meal",
];

const STAFF_ROSTER = [
  { name: "Maria Santos", email: "maria@demo.kitchenos.app", role: "manager" },
  { name: "James Chen", email: "james@demo.kitchenos.app", role: "chef" },
  { name: "Aisha Patel", email: "aisha@demo.kitchenos.app", role: "server" },
  { name: "Tom Bradley", email: "tom@demo.kitchenos.app", role: "cashier" },
  { name: "Elena Rossi", email: "elena@demo.kitchenos.app", role: "prep" },
];

export async function seedCommercialDemoWorkspace(
  userId: string,
  vertical: DemoVerticalSlug = "restaurant",
): Promise<void> {
  await seedDemoWorkspace(userId, vertical);
  const workspaceId = await resolveOwnerWorkspaceId(userId);

  const menuWhere = await menuListWhereForOwnerAnd(userId, {
    active: true,
    catalogOnly: false,
  });
  const activeMenu = await prisma.menu.findFirst({
    where: menuWhere,
    orderBy: { sortOrder: "asc" },
  });
  if (!activeMenu) return;

  const existingProducts = await prisma.product.count({ where: { menuId: activeMenu.id } });
  const needProducts = Math.max(0, 30 - existingProducts);

  for (let i = 0; i < needProducts; i++) {
    const title = EXTRA_PRODUCT_TITLES[i % EXTRA_PRODUCT_TITLES.length]!;
    const price = 5 + (i % 12) + (i % 3) * 0.5;
    await prisma.product.create({
      data: {
        menuId: activeMenu.id,
        title: `${title}${i >= EXTRA_PRODUCT_TITLES.length ? ` #${i + 1}` : ""}`,
        description: "Demo catalog item for commercial launch preview.",
        category: ProductCategory.MAINS,
        active: true,
        price,
        image: DEMO_IMG,
        sortOrder: existingProducts + i,
        preparedDate: new Date(),
        pickupDate: new Date(),
        deliveryAvailable: true,
      },
    });
  }

  const productIds = (
    await prisma.product.findMany({
      where: { menuId: activeMenu.id },
      select: { id: true, price: true },
      take: 30,
    })
  ).map((p) => ({ id: p.id, price: Number(p.price) }));

  await seedDemoTenantBlueprintExtras(userId, workspaceId, productIds);

  const staffWhere = await staffMemberListWhereForOwner(userId);
  const staffCount = await prisma.staffMember.count({ where: staffWhere });
  if (staffCount < 5) {
    for (const s of STAFF_ROSTER.slice(staffCount)) {
      await prisma.staffMember.create({
        data: { userId, name: s.name, email: s.email, role: s.role, active: true },
      });
    }
  }

  const batchWhere = await productionBatchListWhereForOwner(userId);
  const batchExists = await prisma.productionBatch.count({ where: batchWhere });
  if (batchExists === 0) {
    await prisma.productionBatch.create({
      data: {
        userId,
        menuId: activeMenu.id,
        productionDate: new Date(),
        title: "Demo lunch batch",
        mode: ProductionCommandMode.DAILY_PREP,
        status: ProductionBatchStatus.ACTIVE,
        totalItems: productIds.length,
        completedItems: Math.floor(productIds.length / 2),
      },
    });
  }

  const settings = await prisma.kitchenSettings.findUnique({ where: { userId } });
  const storefrontWhere = await storefrontSettingsListWhereForOwner(userId);
  const existingStorefront = await prisma.storefrontSettings.findFirst({
    where: { AND: [storefrontWhere, { isPrimary: true }] },
  });
  if (existingStorefront) {
    await prisma.storefrontSettings.update({
      where: { id: existingStorefront.id },
      data: {
        publicName: settings?.businessName ?? existingStorefront.publicName,
        enabled: true,
        published: true,
        activeMenuId: activeMenu.id,
      },
    });
  } else {
    const slug = `demo-${userId.replace(/-/g, "").slice(0, 10)}`;
    await prisma.storefrontSettings.create({
      data: {
        userId,
        storeSlug: slug,
        publicName: settings?.businessName ?? "Demo Kitchen",
        tagline: "Order online · pickup or delivery",
        enabled: true,
        published: true,
        activeMenuId: activeMenu.id,
        pickupEnabled: true,
        deliveryEnabled: true,
        currency: "USD",
      },
    });
  }
}
