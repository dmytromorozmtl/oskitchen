import type { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import {
  mergeProductInventoryLink,
  parseProductInventoryLink,
  type MarketplaceInventoryLink,
  type MarketplaceInventoryTransaction,
} from "@/lib/marketplace/inventory-link-types";
import {
  ingredientListWhereForOwner,
  inventoryStockListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/services/audit/audit-service";

export type MarketplaceStockSuggestion = {
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  reorderPoint: number;
  unit: string;
  products: Array<{
    productId: string;
    name: string;
    slug: string;
    vendorName: string;
    sku: string;
    basePrice: number;
    stockQty: number;
    moq: number;
  }>;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

async function resolveWorkspaceOwner(workspaceId: string): Promise<{ userId: string } | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerUserId: true },
  });
  if (!workspace) return null;
  return { userId: workspace.ownerUserId };
}

async function recordInventoryPurchase(input: {
  userId: string;
  workspaceId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  purchaseOrderId: string;
  productId: string;
  sku: string;
  actorUserId?: string | null;
}): Promise<MarketplaceInventoryTransaction> {
  const [ingredientWhere, stockWhere] = await Promise.all([
    ingredientListWhereForOwner(input.userId),
    inventoryStockListWhereForOwner(input.userId),
  ]);

  const ingredient = await prisma.ingredient.findFirst({
    where: { AND: [ingredientWhere, { id: input.ingredientId }] },
    select: { id: true, unit: true, name: true },
  });
  if (!ingredient) {
    throw new Error("Linked ingredient not found.");
  }

  const stockRow = await prisma.inventoryStock.findFirst({
    where: {
      AND: [stockWhere, { ingredientId: input.ingredientId, workspaceId: input.workspaceId, locationId: null }],
    },
  });

  if (stockRow) {
    await prisma.inventoryStock.update({
      where: { id: stockRow.id },
      data: { quantityOnHand: { increment: input.quantity } },
    });
  } else {
    await prisma.inventoryStock.create({
      data: {
        userId: input.userId,
        workspaceId: input.workspaceId,
        ingredientId: input.ingredientId,
        quantityOnHand: input.quantity,
        unit: input.unit || ingredient.unit,
      },
    });
  }

  await prisma.ingredient.update({
    where: { id: ingredient.id },
    data: { currentStock: { increment: input.quantity } },
  });

  const transaction: MarketplaceInventoryTransaction = {
    id: randomUUID(),
    type: "PURCHASE",
    workspaceId: input.workspaceId,
    ingredientId: ingredient.id,
    quantity: input.quantity,
    unit: input.unit || ingredient.unit,
    purchaseOrderId: input.purchaseOrderId,
    productId: input.productId,
    sku: input.sku,
    createdAt: new Date().toISOString(),
  };

  await auditLog({
    workspaceId: input.workspaceId,
    actor: {
      userId: input.actorUserId ?? input.userId,
      email: null,
      role: "SYSTEM",
    },
    action: AUDIT_ACTIONS.SETTINGS_UPDATED,
    category: "OTHER",
    source: "SYSTEM",
    severity: "INFO",
    entity: { type: "InventoryTransaction", id: transaction.id, label: ingredient.name },
    metadata: {
      operation: "marketplace.inventory.purchase",
      transactionType: "PURCHASE",
      ...transaction,
    },
  });

  return transaction;
}

export async function linkProductToInventorySKU(input: {
  productId: string;
  vendorId: string;
  ingredientId: string;
  inventorySku?: string | null;
  unitsPerPack?: number;
  linkedByUserId: string;
}): Promise<{ ok: true; link: MarketplaceInventoryLink } | { ok: false; error: string }> {
  const [product, ingredient] = await Promise.all([
    prisma.vendorProduct.findFirst({
      where: { id: input.productId, vendorId: input.vendorId },
      select: { id: true, attributes: true, sku: true },
    }),
    prisma.ingredient.findUnique({
      where: { id: input.ingredientId },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) return { ok: false, error: "Product not found." };
  if (!ingredient) return { ok: false, error: "Ingredient not found." };

  const link: MarketplaceInventoryLink = {
    ingredientId: ingredient.id,
    inventorySku: input.inventorySku?.trim() || product.sku,
    unitsPerPack: input.unitsPerPack && input.unitsPerPack > 0 ? input.unitsPerPack : 1,
    linkedAt: new Date().toISOString(),
    linkedByUserId: input.linkedByUserId,
  };

  await prisma.vendorProduct.update({
    where: { id: product.id },
    data: {
      attributes: mergeProductInventoryLink(product.attributes, link) as Prisma.InputJsonValue,
    },
  });

  return { ok: true, link };
}

export async function autoUpdateStock(input: {
  productId: string;
  deltaQty: number;
}): Promise<{ ok: true; stockQty: number } | { ok: false; error: string }> {
  const product = await prisma.vendorProduct.findUnique({
    where: { id: input.productId },
    select: { id: true, stockQty: true, allowBackorder: true, status: true },
  });
  if (!product) return { ok: false, error: "Product not found." };

  const nextQty = Math.max(0, product.stockQty + input.deltaQty);
  await prisma.vendorProduct.update({
    where: { id: product.id },
    data: {
      stockQty: nextQty,
      ...(nextQty <= 0 && !product.allowBackorder ? { status: "OUT_OF_STOCK" as const } : {}),
      ...(nextQty > 0 && product.status === "OUT_OF_STOCK" ? { status: "ACTIVE" as const } : {}),
    },
  });

  return { ok: true, stockQty: nextQty };
}

export async function onOrderReceived(input: {
  workspaceId: string;
  orderId: string;
  actorUserId?: string | null;
}): Promise<{ ok: true; transactions: MarketplaceInventoryTransaction[] } | { ok: false; error: string }> {
  const owner = await resolveWorkspaceOwner(input.workspaceId);
  if (!owner) return { ok: false, error: "Workspace not found." };

  const order = await prisma.marketplacePurchaseOrder.findFirst({
    where: { id: input.orderId, workspaceId: input.workspaceId },
    include: {
      items: {
        include: {
          product: { select: { id: true, attributes: true, sku: true, stockQty: true } },
        },
      },
    },
  });
  if (!order) return { ok: false, error: "Order not found." };

  const transactions: MarketplaceInventoryTransaction[] = [];

  for (const line of order.items) {
    if (line.receivedQuantity <= 0) continue;

    const link = parseProductInventoryLink(line.product.attributes);
    if (!link) continue;

    const inventoryQty = line.receivedQuantity * link.unitsPerPack;
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: link.ingredientId },
      select: { unit: true },
    });
    if (!ingredient) continue;

    const transaction = await recordInventoryPurchase({
      userId: owner.userId,
      workspaceId: input.workspaceId,
      ingredientId: link.ingredientId,
      quantity: inventoryQty,
      unit: ingredient.unit,
      purchaseOrderId: order.id,
      productId: line.productId,
      sku: line.sku,
      actorUserId: input.actorUserId,
    });
    transactions.push(transaction);

    await autoUpdateStock({
      productId: line.productId,
      deltaQty: -line.receivedQuantity,
    });
  }

  return { ok: true, transactions };
}

export async function suggestMarketplaceForLowStock(input: {
  workspaceId: string;
  userId: string;
  limit?: number;
}): Promise<MarketplaceStockSuggestion[]> {
  const take = input.limit ?? 8;
  const [ingredientWhere, productRows] = await Promise.all([
    ingredientListWhereForOwner(input.userId),
    prisma.vendorProduct.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        basePrice: true,
        stockQty: true,
        moq: true,
        attributes: true,
        vendor: { select: { companyName: true } },
      },
      take: 500,
    }),
  ]);

  const productsByIngredient = new Map<string, typeof productRows>();
  for (const product of productRows) {
    const link = parseProductInventoryLink(product.attributes);
    if (!link) continue;
    const bucket = productsByIngredient.get(link.ingredientId) ?? [];
    bucket.push(product);
    productsByIngredient.set(link.ingredientId, bucket);
  }

  const candidates = await prisma.ingredient.findMany({
    where: {
      AND: [ingredientWhere, { workspaceId: input.workspaceId, active: true, reorderPoint: { not: null } }],
    },
    select: {
      id: true,
      name: true,
      unit: true,
      currentStock: true,
      reorderPoint: true,
    },
    take: 50,
  });

  const filtered = candidates.filter((ingredient) => {
    const reorderPoint = decimalToNumber(ingredient.reorderPoint);
    if (reorderPoint <= 0) return false;
    return decimalToNumber(ingredient.currentStock) <= reorderPoint;
  });

  return filtered.slice(0, take).map((ingredient) => ({
    ingredientId: ingredient.id,
    ingredientName: ingredient.name,
    currentStock: decimalToNumber(ingredient.currentStock),
    reorderPoint: decimalToNumber(ingredient.reorderPoint),
    unit: ingredient.unit,
    products: (productsByIngredient.get(ingredient.id) ?? []).slice(0, 4).map((product) => ({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      vendorName: product.vendor.companyName,
      sku: product.sku,
      basePrice: decimalToNumber(product.basePrice),
      stockQty: product.stockQty,
      moq: product.moq,
    })),
  }));
}
