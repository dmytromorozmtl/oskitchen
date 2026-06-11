import { FulfillmentType, MarketplaceProductStatus, OrderStatus } from "@prisma/client";
import { randomUUID } from "crypto";

import {
  DEMO_TENANT_INVENTORY_CATALOG,
  DEMO_TENANT_INVENTORY_ITEM_COUNT,
  DEMO_TENANT_ORDER_COUNT,
  DEMO_TENANT_VENDOR_COUNT,
  DEMO_TENANT_VENDORS,
} from "@/lib/demo/demo-tenant-seed-policy";
import {
  ingredientListWhereForOwner,
  inventoryStockListWhereForOwner,
  orderListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export type DemoTenantSeedResult = {
  ordersCreated: number;
  ordersTotal: number;
  vendorsCreated: number;
  vendorsTotal: number;
  inventoryItemsCreated: number;
  inventoryItemsTotal: number;
};

async function ensureDemoMarketplaceCategoryId(): Promise<string | null> {
  const existing = await prisma.marketplaceProductCategory.findFirst({
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.marketplaceProductCategory.create({
    data: {
      name: "Demo Supplies",
      slug: "demo-supplies",
      description: "Demo marketplace category for blueprint tenant seed.",
      sortOrder: 0,
    },
    select: { id: true },
  });
  return created.id;
}

async function seedDemoTenantOrders(
  userId: string,
  workspaceId: string | null,
  productIds: Array<{ id: string; price: number }>,
): Promise<{ created: number; total: number }> {
  const orderWhere = await orderListWhereForOwner(userId);
  const orderCount = await prisma.order.count({ where: orderWhere });
  const needOrders = Math.max(0, DEMO_TENANT_ORDER_COUNT - orderCount);
  const statuses = [
    OrderStatus.COMPLETED,
    OrderStatus.READY,
    OrderStatus.PREPARING,
    OrderStatus.CONFIRMED,
  ] as const;

  for (let o = 0; o < needOrders; o++) {
    const line = productIds[o % productIds.length]!;
    const qty = 1 + (o % 3);
    await prisma.order.create({
      data: {
        userId,
        workspaceId,
        customerName: `Demo Customer ${orderCount + o + 1}`,
        customerEmail: `demo${orderCount + o + 1}@example.com`,
        customerPhone: "+1 512-555-0199",
        total: line.price * qty,
        status: statuses[o % statuses.length]!,
        fulfillmentType: o % 2 === 0 ? FulfillmentType.PICKUP : FulfillmentType.DELIVERY,
        pickupDate: new Date(Date.now() - o * 3600000),
        publicLookupToken: randomUUID().replace(/-/g, "").slice(0, 12),
        orderItems: { create: [{ productId: line.id, quantity: qty }] },
      },
    });
  }

  const total = await prisma.order.count({ where: orderWhere });
  return { created: needOrders, total };
}

async function seedDemoTenantInventory(userId: string): Promise<{ created: number; total: number }> {
  const [ingredientWhere, stockWhere] = await Promise.all([
    ingredientListWhereForOwner(userId),
    inventoryStockListWhereForOwner(userId),
  ]);

  let created = 0;
  for (const ing of DEMO_TENANT_INVENTORY_CATALOG) {
    const existing = await prisma.ingredient.findFirst({
      where: { AND: [ingredientWhere, { name: ing.name }] },
    });
    if (!existing) created += 1;

    const ingredient =
      existing ??
      (await prisma.ingredient.create({
        data: {
          userId,
          name: ing.name,
          unit: ing.unit,
          costPerUnit: ing.cost,
          currentStock: ing.stock,
          parLevel: Math.max(1, Math.round(ing.stock * 0.5)),
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

  const total = await prisma.ingredient.count({ where: ingredientWhere });
  return { created, total };
}

async function seedDemoTenantVendors(): Promise<{ created: number; total: number }> {
  const categoryId = await ensureDemoMarketplaceCategoryId();
  let created = 0;

  for (const [index, vendorSeed] of DEMO_TENANT_VENDORS.entries()) {
    const existing = await prisma.vendor.findFirst({
      where: { companyName: vendorSeed.companyName },
      select: { id: true },
    });
    if (existing) continue;

    const vendor = await prisma.vendor.create({
      data: {
        companyName: vendorSeed.companyName,
        legalName: vendorSeed.legalName,
        type: vendorSeed.type,
        status: "APPROVED",
        verifiedAt: new Date(),
        commissionRate: 5,
        documents: [],
      },
    });
    created += 1;

    if (categoryId) {
      const sku = `DEMO-${index + 1}-001`;
      await prisma.vendorProduct.create({
        data: {
          vendorId: vendor.id,
          name: `${vendorSeed.companyName} Starter Pack`,
          sku,
          categoryId,
          description: "Demo marketplace catalog item for operator preview.",
          status: MarketplaceProductStatus.ACTIVE,
          basePrice: 24.99 + index * 5,
          currency: "USD",
          priceUnit: "PER_CASE",
          moq: 1,
          orderIncrement: 1,
          stockQty: 100,
          leadTimeDays: 2,
          slug: `demo-${vendorSeed.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${sku.toLowerCase()}`,
        },
      });
    }
  }

  const demoVendorNames = DEMO_TENANT_VENDORS.map((row) => row.companyName);
  const total = await prisma.vendor.count({
    where: { companyName: { in: [...demoVendorNames] }, status: "APPROVED" },
  });
  return { created, total };
}

/** Blueprint demo tenant extras — 50 orders, 3 vendors, 20 inventory items. */
export async function seedDemoTenantBlueprintExtras(
  userId: string,
  workspaceId: string | null,
  productIds: Array<{ id: string; price: number }>,
): Promise<DemoTenantSeedResult> {
  const [orders, inventory, vendors] = await Promise.all([
    seedDemoTenantOrders(userId, workspaceId, productIds),
    seedDemoTenantInventory(userId),
    seedDemoTenantVendors(),
  ]);

  return {
    ordersCreated: orders.created,
    ordersTotal: orders.total,
    vendorsCreated: vendors.created,
    vendorsTotal: vendors.total,
    inventoryItemsCreated: inventory.created,
    inventoryItemsTotal: inventory.total,
  };
}

export {
  DEMO_TENANT_INVENTORY_ITEM_COUNT,
  DEMO_TENANT_ORDER_COUNT,
  DEMO_TENANT_VENDOR_COUNT,
};
