import {
  buildSupplierLaneSnapshot,
  buildSupplierMarketplaceDashboard,
} from "@/lib/marketplace/supplier-marketplace-builders";
import {
  SUPPLIER_LANE_CATEGORY_SLUGS,
  SUPPLIER_MARKETPLACE_LANES,
  type SupplierMarketplaceLaneId,
} from "@/lib/marketplace/supplier-marketplace-policy";
import type {
  SupplierLaneProduct,
  SupplierMarketplaceDashboard,
  SupplierOneClickReorder,
} from "@/lib/marketplace/supplier-marketplace-types";
import { prisma } from "@/lib/prisma";

export type { SupplierMarketplaceDashboard } from "@/lib/marketplace/supplier-marketplace-types";

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function mapLaneProduct(product: {
  id: string;
  name: string;
  slug: string;
  basePrice: { toString(): string };
  currency: string;
  priceUnit: string;
  stockQty: number;
  allowBackorder: boolean;
  vendor: { companyName: string };
}): SupplierLaneProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    vendorName: product.vendor.companyName,
    basePrice: decimalToNumber(product.basePrice),
    currency: product.currency,
    priceUnit: product.priceUnit,
    inStock: product.stockQty > 0 || product.allowBackorder,
  };
}

async function loadRecentReorderForLane(
  workspaceId: string,
  categoryIds: string[],
  lane: SupplierMarketplaceLaneId,
): Promise<SupplierOneClickReorder | null> {
  if (categoryIds.length === 0) return null;

  const line = await prisma.marketplacePOLineItem.findFirst({
    where: {
      purchaseOrder: {
        workspaceId,
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      product: {
        status: "ACTIVE",
        categoryId: { in: categoryIds },
      },
    },
    orderBy: { purchaseOrder: { createdAt: "desc" } },
    include: {
      product: { select: { slug: true } },
      purchaseOrder: {
        select: {
          id: true,
          vendorId: true,
          currency: true,
          createdAt: true,
          vendor: { select: { companyName: true } },
        },
      },
    },
  });

  if (!line) return null;

  return {
    id: `${lane}-${line.purchaseOrder.id}-${line.productId}`,
    lane,
    productId: line.productId,
    productName: line.productName,
    slug: line.product.slug,
    sku: line.sku,
    vendorId: line.purchaseOrder.vendorId,
    vendorName: line.purchaseOrder.vendor.companyName,
    quantity: line.quantity,
    unitPrice: decimalToNumber(line.unitPrice),
    currency: line.purchaseOrder.currency,
    lastOrderedAtIso: line.purchaseOrder.createdAt.toISOString(),
  };
}

async function loadSupplierLane(workspaceId: string, lane: SupplierMarketplaceLaneId) {
  const slugs = [...SUPPLIER_LANE_CATEGORY_SLUGS[lane]];
  const categories = await prisma.marketplaceProductCategory.findMany({
    where: { slug: { in: slugs } },
    select: { id: true },
  });
  const categoryIds = categories.map((row) => row.id);

  const productWhere = {
    status: "ACTIVE" as const,
    ...(categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : { id: "none" }),
  };

  const [productCount, vendorGroups, topProducts, oneClickReorder] = await Promise.all([
    categoryIds.length > 0
      ? prisma.vendorProduct.count({ where: productWhere })
      : Promise.resolve(0),
    categoryIds.length > 0
      ? prisma.vendorProduct
          .groupBy({
            by: ["vendorId"],
            where: productWhere,
          })
          .then((rows) => rows.length)
      : Promise.resolve(0),
    categoryIds.length > 0
      ? prisma.vendorProduct.findMany({
          where: productWhere,
          orderBy: [{ stockQty: "desc" }, { createdAt: "desc" }],
          take: 3,
          include: { vendor: { select: { companyName: true } } },
        })
      : Promise.resolve([]),
    loadRecentReorderForLane(workspaceId, categoryIds, lane),
  ]);

  return buildSupplierLaneSnapshot({
    lane,
    productCount,
    vendorCount: vendorGroups,
    topProducts: topProducts.map(mapLaneProduct),
    oneClickReorder,
  });
}

export async function loadSupplierMarketplaceDashboard(
  workspaceId: string,
): Promise<SupplierMarketplaceDashboard> {
  const lanes = await Promise.all(
    SUPPLIER_MARKETPLACE_LANES.map((lane) => loadSupplierLane(workspaceId, lane)),
  );

  return buildSupplierMarketplaceDashboard({
    workspaceId,
    lanes,
  });
}
