/**
 * Commercial launch demo extras — extends `seedDemoWorkspace` to hit launch checklist:
 * 30 products, 15 orders, 5 staff, inventory, production batch, storefront.
 */
import { randomUUID } from "crypto";

import {
  OrderStatus,
  ProductCategory,
  ProductionBatchStatus,
  ProductionCommandMode,
  FulfillmentType,
} from "@prisma/client";

import type { DemoVerticalSlug } from "@/lib/demo-verticals";
import { prisma } from "@/lib/prisma";
import {
  ingredientListWhereForOwner,
  inventoryStockListWhereForOwner,
  menuListWhereForOwnerAnd,
  orderListWhereForOwner,
  productionBatchListWhereForOwner,
  staffMemberListWhereForOwner,
  storefrontSettingsListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { seedDemoWorkspace } from "@/services/demo-data";

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

const INGREDIENTS = [
  { name: "Ground beef", unit: "lb", cost: 4.5, stock: 24 },
  { name: "Romaine lettuce", unit: "head", cost: 2.2, stock: 18 },
  { name: "Mozzarella", unit: "lb", cost: 5.8, stock: 12 },
];

function token12(): string {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

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

  const orderWhere = await orderListWhereForOwner(userId);
  const orderCount = await prisma.order.count({ where: orderWhere });
  const needOrders = Math.max(0, 15 - orderCount);

  for (let o = 0; o < needOrders; o++) {
    const line = productIds[o % productIds.length]!;
    const qty = 1 + (o % 2);
    await prisma.order.create({
      data: {
        userId,
        workspaceId,
        customerName: `Demo Customer ${orderCount + o + 1}`,
        customerEmail: `demo${orderCount + o + 1}@example.com`,
        customerPhone: "+1 512-555-0199",
        total: line.price * qty,
        status: [OrderStatus.COMPLETED, OrderStatus.READY, OrderStatus.PREPARING][o % 3]!,
        fulfillmentType: o % 2 === 0 ? FulfillmentType.PICKUP : FulfillmentType.DELIVERY,
        pickupDate: new Date(Date.now() - o * 86400000),
        publicLookupToken: token12(),
        orderItems: { create: [{ productId: line.id, quantity: qty }] },
      },
    });
  }

  const staffWhere = await staffMemberListWhereForOwner(userId);
  const staffCount = await prisma.staffMember.count({ where: staffWhere });
  if (staffCount < 5) {
    for (const s of STAFF_ROSTER.slice(staffCount)) {
      await prisma.staffMember.create({
        data: { userId, name: s.name, email: s.email, role: s.role, active: true },
      });
    }
  }

  const [ingredientWhere, stockWhere] = await Promise.all([
    ingredientListWhereForOwner(userId),
    inventoryStockListWhereForOwner(userId),
  ]);

  for (const ing of INGREDIENTS) {
    const existing = await prisma.ingredient.findFirst({
      where: { AND: [ingredientWhere, { name: ing.name }] },
    });
    const ingredient =
      existing ??
      (await prisma.ingredient.create({
        data: {
          userId,
          name: ing.name,
          unit: ing.unit,
          costPerUnit: ing.cost,
          currentStock: ing.stock,
          parLevel: ing.stock * 0.5,
          active: true,
        },
      }));

    const stockRow = await prisma.inventoryStock.findFirst({
      where: { AND: [stockWhere, { ingredientId: ingredient.id }] },
    });
    if (stockRow) {
      await prisma.inventoryStock.update({
        where: { id: stockRow.id },
        data: { quantityOnHand: ing.stock, unit: ing.unit },
      });
    } else {
      await prisma.inventoryStock.create({
        data: {
          userId,
          ingredientId: ingredient.id,
          quantityOnHand: ing.stock,
          unit: ing.unit,
        },
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
