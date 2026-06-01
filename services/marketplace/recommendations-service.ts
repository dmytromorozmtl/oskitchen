import type { BusinessType } from "@prisma/client";
import { subDays } from "date-fns";

import {
  mergeRecommendationCategorySlugs,
  rankRecommendationProducts,
  recommendationCategorySlugsForBusinessType,
  type MarketplaceRecommendationBundle,
  type MarketplaceRecommendationProduct,
} from "@/lib/marketplace/recommendations-types";
import { prisma } from "@/lib/prisma";

const ACTIVE_PRODUCT_WHERE = {
  status: "ACTIVE" as const,
  vendor: { status: "APPROVED" as const },
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function mapRecommendationProduct(
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: { toString(): string };
    currency: string;
    priceUnit: string;
    leadTimeDays: number;
    stockQty: number;
    allowBackorder: boolean;
    vendor: { companyName: string };
  },
  reason?: string,
): MarketplaceRecommendationProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    vendorName: product.vendor.companyName,
    basePrice: decimalToNumber(product.basePrice),
    currency: product.currency,
    priceUnit: product.priceUnit,
    leadTimeDays: product.leadTimeDays,
    inStock: product.stockQty > 0 || product.allowBackorder,
    reason,
  };
}

async function resolveWorkspaceOwnerUserId(workspaceId: string): Promise<string | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerUserId: true },
  });
  return workspace?.ownerUserId ?? null;
}

async function loadOrderHistoryCategorySlugs(workspaceId: string): Promise<string[]> {
  const since = subDays(new Date(), 90);
  const lines = await prisma.marketplacePOLineItem.findMany({
    where: {
      purchaseOrder: {
        workspaceId,
        createdAt: { gte: since },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
    },
    select: { product: { select: { category: { select: { slug: true } } } } },
    take: 200,
  });

  return [...new Set(lines.map((line) => line.product.category.slug))];
}

async function loadInventoryPriorityProductIds(input: {
  workspaceId: string;
  userId: string;
}): Promise<string[]> {
  const { suggestMarketplaceForLowStock } = await import(
    "@/services/marketplace/inventory-integration-service"
  );
  const suggestions = await suggestMarketplaceForLowStock({
    workspaceId: input.workspaceId,
    userId: input.userId,
    limit: 6,
  });
  return suggestions.flatMap((row) => row.products.map((product) => product.productId));
}

export async function loadPersonalizedRecommendations(input: {
  workspaceId: string;
  businessType?: BusinessType | null;
  userId?: string | null;
  limit?: number;
}): Promise<MarketplaceRecommendationProduct[]> {
  const limit = input.limit ?? 6;
  const ownerUserId = input.userId ?? (await resolveWorkspaceOwnerUserId(input.workspaceId));

  const [historySlugs, inventoryProductIds] = await Promise.all([
    loadOrderHistoryCategorySlugs(input.workspaceId),
    ownerUserId
      ? loadInventoryPriorityProductIds({ workspaceId: input.workspaceId, userId: ownerUserId })
      : Promise.resolve([]),
  ]);

  const categorySlugs = mergeRecommendationCategorySlugs(
    recommendationCategorySlugsForBusinessType(input.businessType),
    historySlugs,
  );

  const [priorityProducts, categoryProducts] = await Promise.all([
    inventoryProductIds.length > 0
      ? prisma.vendorProduct.findMany({
          where: { ...ACTIVE_PRODUCT_WHERE, id: { in: inventoryProductIds } },
          include: { vendor: { select: { companyName: true } } },
        })
      : Promise.resolve([]),
    categorySlugs.length > 0
      ? prisma.vendorProduct.findMany({
          where: {
            ...ACTIVE_PRODUCT_WHERE,
            category: { slug: { in: categorySlugs } },
          },
          orderBy: { updatedAt: "desc" },
          take: limit * 2,
          include: { vendor: { select: { companyName: true } } },
        })
      : prisma.vendorProduct.findMany({
          where: ACTIVE_PRODUCT_WHERE,
          orderBy: { updatedAt: "desc" },
          take: limit,
          include: { vendor: { select: { companyName: true } } },
        }),
  ]);

  const merged = rankRecommendationProducts(
    [...priorityProducts, ...categoryProducts].map((product, index) => ({
      ...mapRecommendationProduct(
        product,
        index < priorityProducts.length ? "Low stock replenishment" : undefined,
      ),
      id: product.id,
    })),
    inventoryProductIds,
  );

  const seen = new Set<string>();
  const result: MarketplaceRecommendationProduct[] = [];
  for (const product of merged) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    result.push(product);
    if (result.length >= limit) break;
  }

  return result;
}

export async function loadFrequentlyBoughtTogether(input: {
  productId: string;
  limit?: number;
}): Promise<MarketplaceRecommendationProduct[]> {
  const limit = input.limit ?? 6;

  const coPurchaseRows = await prisma.marketplacePOLineItem.findMany({
    where: {
      productId: input.productId,
      purchaseOrder: { status: { notIn: ["DRAFT", "CANCELLED"] } },
    },
    select: { purchaseOrderId: true },
    take: 80,
  });

  const orderIds = [...new Set(coPurchaseRows.map((row) => row.purchaseOrderId))];
  if (orderIds.length === 0) return [];

  const products = await prisma.vendorProduct.findMany({
    where: {
      ...ACTIVE_PRODUCT_WHERE,
      id: { not: input.productId },
      orderItems: { some: { purchaseOrderId: { in: orderIds } } },
    },
    take: limit,
    include: { vendor: { select: { companyName: true } } },
  });

  return products.map((product) => mapRecommendationProduct(product, "Frequently bought together"));
}

export async function loadSimilarProducts(input: {
  productId: string;
  categoryId: string;
  vendorId: string;
  limit?: number;
}): Promise<MarketplaceRecommendationProduct[]> {
  const limit = input.limit ?? 6;

  const products = await prisma.vendorProduct.findMany({
    where: {
      ...ACTIVE_PRODUCT_WHERE,
      id: { not: input.productId },
      OR: [{ vendorId: input.vendorId }, { categoryId: input.categoryId }],
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: { vendor: { select: { companyName: true } } },
  });

  return products.map((product) => mapRecommendationProduct(product, "Similar product"));
}

export async function loadPopularInRegion(input: {
  workspaceId: string;
  limit?: number;
}): Promise<MarketplaceRecommendationProduct[]> {
  const limit = input.limit ?? 6;
  const since = subDays(new Date(), 90);

  const workspace = await prisma.workspace.findUnique({
    where: { id: input.workspaceId },
    select: { organizationId: true },
  });

  const lineItems = await prisma.marketplacePOLineItem.groupBy({
    by: ["productId"],
    where: {
      purchaseOrder: {
        createdAt: { gte: since },
        status: { notIn: ["DRAFT", "CANCELLED"] },
        ...(workspace?.organizationId
          ? { workspace: { organizationId: workspace.organizationId } }
          : { workspaceId: input.workspaceId }),
      },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  if (lineItems.length === 0) {
    const fallback = await prisma.vendorProduct.findMany({
      where: ACTIVE_PRODUCT_WHERE,
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: { vendor: { select: { companyName: true } } },
    });
    return fallback.map((product) => mapRecommendationProduct(product, "Trending catalog"));
  }

  const products = await prisma.vendorProduct.findMany({
    where: {
      ...ACTIVE_PRODUCT_WHERE,
      id: { in: lineItems.map((row) => row.productId) },
    },
    include: { vendor: { select: { companyName: true } } },
  });

  const productById = new Map(products.map((product) => [product.id, product]));
  return lineItems
    .map((row) => productById.get(row.productId))
    .filter((product): product is NonNullable<typeof product> => product != null)
    .map((product) => mapRecommendationProduct(product, "Popular in your region"));
}

export async function loadMarketplaceRecommendationsBundle(input: {
  workspaceId: string;
  businessType?: BusinessType | null;
  userId?: string | null;
}): Promise<MarketplaceRecommendationBundle> {
  const [personalized, popularInRegion] = await Promise.all([
    loadPersonalizedRecommendations(input),
    loadPopularInRegion({ workspaceId: input.workspaceId }),
  ]);

  return {
    personalized,
    popularInRegion,
    frequentlyBoughtTogether: [],
    similarProducts: [],
  };
}

export { recommendationCategorySlugsForBusinessType } from "@/lib/marketplace/recommendations-types";
