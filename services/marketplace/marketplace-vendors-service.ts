import type { Prisma } from "@prisma/client";

import {
  marketplacePrefsFromSettingsCenter,
  mergeMarketplacePrefsIntoSettingsCenter,
  parseMarketplaceVendorPreferences,
  type MarketplaceVendorContract,
  type MarketplaceVendorPreferences,
} from "@/lib/marketplace/vendor-preferences";
import { prisma } from "@/lib/prisma";

export type MarketplaceVendorCard = {
  id: string;
  companyName: string;
  type: string;
  planTier: string;
  isFavorite: boolean;
  orderCount: number;
  totalSpent: number;
  currency: string;
  avgRating: number | null;
  reviewCount: number;
  avgDeliveryDays: number | null;
  productCount: number;
  lastOrderAt: string | null;
};

export type MarketplaceVendorOrderRow = {
  id: string;
  poNumber: string | null;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  itemCount: number;
};

export type MarketplaceVendorDetail = {
  id: string;
  companyName: string;
  legalName: string;
  type: string;
  planTier: string;
  verifiedAt: string | null;
  isFavorite: boolean;
  orderCount: number;
  totalSpent: number;
  currency: string;
  avgRating: number | null;
  reviewCount: number;
  avgDeliveryDays: number | null;
  productCount: number;
  contract: MarketplaceVendorContract | null;
  orders: MarketplaceVendorOrderRow[];
  rateableOrders: Array<{ id: string; poNumber: string | null; createdAt: string }>;
  topProducts: Array<{ id: string; name: string; slug: string; basePrice: number; currency: string }>;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

async function loadKitchenSettingsCenter(dataUserId: string) {
  return prisma.kitchenSettings.findUnique({
    where: { userId: dataUserId },
    select: { settingsCenterJson: true },
  });
}

export async function loadMarketplaceVendorPreferences(
  dataUserId: string,
): Promise<MarketplaceVendorPreferences> {
  const kitchen = await loadKitchenSettingsCenter(dataUserId);
  return marketplacePrefsFromSettingsCenter(kitchen?.settingsCenterJson);
}

export async function saveMarketplaceVendorPreferences(
  dataUserId: string,
  prefs: MarketplaceVendorPreferences,
): Promise<void> {
  const kitchen = await loadKitchenSettingsCenter(dataUserId);
  const merged = mergeMarketplacePrefsIntoSettingsCenter(kitchen?.settingsCenterJson, prefs);
  await prisma.kitchenSettings.update({
    where: { userId: dataUserId },
    data: { settingsCenterJson: merged as Prisma.InputJsonValue },
  });
}

export async function loadMyMarketplaceVendors(input: {
  workspaceId: string;
  dataUserId: string;
  favoritesOnly?: boolean;
  query?: string;
}): Promise<{ vendors: MarketplaceVendorCard[]; favorites: MarketplaceVendorCard[] }> {
  const prefs = await loadMarketplaceVendorPreferences(input.dataUserId);

  const orderStats = await prisma.marketplacePurchaseOrder.groupBy({
    by: ["vendorId"],
    where: {
      workspaceId: input.workspaceId,
      status: { notIn: ["DRAFT", "CANCELLED"] },
    },
    _count: { _all: true },
    _sum: { total: true },
    _max: { createdAt: true },
  });

  const vendorIdsFromOrders = new Set(orderStats.map((row) => row.vendorId));
  const vendorIdSet = input.favoritesOnly
    ? new Set(prefs.favoriteVendorIds)
    : new Set([...vendorIdsFromOrders, ...prefs.favoriteVendorIds]);

  if (vendorIdSet.size === 0) {
    return { vendors: [], favorites: [] };
  }

  const vendorIds = [...vendorIdSet];
  const [vendors, ratings, deliveryAgg, productCounts] = await Promise.all([
    prisma.vendor.findMany({
      where: {
        id: { in: vendorIds },
        status: "APPROVED",
        ...(input.query
          ? { companyName: { contains: input.query, mode: "insensitive" as const } }
          : {}),
      },
      orderBy: { companyName: "asc" },
    }),
    prisma.marketplaceVendorReview.groupBy({
      by: ["vendorId"],
      where: { vendorId: { in: vendorIds }, workspaceId: input.workspaceId },
      _avg: { overall: true },
      _count: { _all: true },
    }),
    prisma.marketplacePurchaseOrder.findMany({
      where: {
        workspaceId: input.workspaceId,
        vendorId: { in: vendorIds },
        status: { in: ["DELIVERED", "COMPLETED"] },
        requestedDeliveryDate: { not: null },
        confirmedDeliveryDate: { not: null },
      },
      select: {
        vendorId: true,
        requestedDeliveryDate: true,
        confirmedDeliveryDate: true,
      },
    }),
    prisma.vendorProduct.groupBy({
      by: ["vendorId"],
      where: { vendorId: { in: vendorIds }, status: "ACTIVE" },
      _count: { _all: true },
    }),
  ]);

  const statsByVendor = new Map(
    orderStats.map((row) => [
      row.vendorId,
      {
        orderCount: row._count._all,
        totalSpent: decimalToNumber(row._sum.total),
        lastOrderAt: row._max.createdAt?.toISOString() ?? null,
      },
    ]),
  );

  const ratingByVendor = new Map(
    ratings.map((row) => [
      row.vendorId,
      {
        avg: row._avg.overall != null ? Math.round(Number(row._avg.overall) * 10) / 10 : null,
        count: row._count._all,
      },
    ]),
  );

  const deliveryByVendor = new Map<string, number[]>();
  for (const row of deliveryAgg) {
    if (!row.requestedDeliveryDate || !row.confirmedDeliveryDate) continue;
    const days = Math.max(
      0,
      Math.round(
        (row.confirmedDeliveryDate.getTime() - row.requestedDeliveryDate.getTime()) /
          (24 * 60 * 60 * 1000),
      ),
    );
    const list = deliveryByVendor.get(row.vendorId) ?? [];
    list.push(days);
    deliveryByVendor.set(row.vendorId, list);
  }

  const productsByVendor = new Map(
    productCounts.map((row) => [row.vendorId, row._count._all]),
  );

  const cards: MarketplaceVendorCard[] = vendors.map((vendor) => {
    const stats = statsByVendor.get(vendor.id);
    const rating = ratingByVendor.get(vendor.id);
    const deliveryDays = deliveryByVendor.get(vendor.id);
    const avgDeliveryDays =
      deliveryDays && deliveryDays.length > 0
        ? Math.round(deliveryDays.reduce((sum, value) => sum + value, 0) / deliveryDays.length)
        : null;

    return {
      id: vendor.id,
      companyName: vendor.companyName,
      type: vendor.type,
      planTier: vendor.planTier,
      isFavorite: prefs.favoriteVendorIds.includes(vendor.id),
      orderCount: stats?.orderCount ?? 0,
      totalSpent: stats?.totalSpent ?? 0,
      currency: "USD",
      avgRating: rating?.avg ?? null,
      reviewCount: rating?.count ?? 0,
      avgDeliveryDays,
      productCount: productsByVendor.get(vendor.id) ?? 0,
      lastOrderAt: stats?.lastOrderAt ?? null,
    };
  });

  cards.sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
    return b.totalSpent - a.totalSpent;
  });

  const favorites = cards.filter((card) => card.isFavorite);

  return { vendors: cards, favorites };
}

export async function loadMarketplaceVendorDetail(input: {
  workspaceId: string;
  dataUserId: string;
  vendorId: string;
}): Promise<MarketplaceVendorDetail | null> {
  const [vendor, prefs, orders, rateableOrders, topProducts] = await Promise.all([
    prisma.vendor.findFirst({
      where: { id: input.vendorId, status: "APPROVED" },
    }),
    loadMarketplaceVendorPreferences(input.dataUserId),
    prisma.marketplacePurchaseOrder.findMany({
      where: { workspaceId: input.workspaceId, vendorId: input.vendorId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { _count: { select: { items: true } } },
    }),
    prisma.marketplacePurchaseOrder.findMany({
      where: {
        workspaceId: input.workspaceId,
        vendorId: input.vendorId,
        status: { in: ["DELIVERED", "COMPLETED"] },
        review: null,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, poNumber: true, createdAt: true },
    }),
    prisma.vendorProduct.findMany({
      where: { vendorId: input.vendorId, status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: { id: true, name: true, slug: true, basePrice: true, currency: true },
    }),
  ]);

  if (!vendor) return null;

  const [ratingAgg, orderAgg, deliveryRows, productCount] = await Promise.all([
    prisma.marketplaceVendorReview.aggregate({
      where: { vendorId: input.vendorId, workspaceId: input.workspaceId },
      _avg: { overall: true },
      _count: { _all: true },
    }),
    prisma.marketplacePurchaseOrder.aggregate({
      where: {
        workspaceId: input.workspaceId,
        vendorId: input.vendorId,
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.marketplacePurchaseOrder.findMany({
      where: {
        workspaceId: input.workspaceId,
        vendorId: input.vendorId,
        status: { in: ["DELIVERED", "COMPLETED"] },
        requestedDeliveryDate: { not: null },
        confirmedDeliveryDate: { not: null },
      },
      select: { requestedDeliveryDate: true, confirmedDeliveryDate: true },
    }),
    prisma.vendorProduct.count({
      where: { vendorId: input.vendorId, status: "ACTIVE" },
    }),
  ]);

  const deliveryDays = deliveryRows
    .filter((row) => row.requestedDeliveryDate && row.confirmedDeliveryDate)
    .map((row) =>
      Math.max(
        0,
        Math.round(
          (row.confirmedDeliveryDate!.getTime() - row.requestedDeliveryDate!.getTime()) /
            (24 * 60 * 60 * 1000),
        ),
      ),
    );

  return {
    id: vendor.id,
    companyName: vendor.companyName,
    legalName: vendor.legalName,
    type: vendor.type,
    planTier: vendor.planTier,
    verifiedAt: vendor.verifiedAt?.toISOString() ?? null,
    isFavorite: prefs.favoriteVendorIds.includes(vendor.id),
    orderCount: orderAgg._count._all,
    totalSpent: decimalToNumber(orderAgg._sum.total),
    currency: "USD",
    avgRating:
      ratingAgg._avg.overall != null
        ? Math.round(Number(ratingAgg._avg.overall) * 10) / 10
        : null,
    reviewCount: ratingAgg._count._all,
    avgDeliveryDays:
      deliveryDays.length > 0
        ? Math.round(deliveryDays.reduce((sum, value) => sum + value, 0) / deliveryDays.length)
        : null,
    productCount,
    contract: prefs.vendorContracts[vendor.id] ?? null,
    orders: orders.map((order) => ({
      id: order.id,
      poNumber: order.poNumber,
      status: order.status,
      total: decimalToNumber(order.total),
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
      itemCount: order._count.items,
    })),
    rateableOrders: rateableOrders.map((order) => ({
      id: order.id,
      poNumber: order.poNumber,
      createdAt: order.createdAt.toISOString(),
    })),
    topProducts: topProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      basePrice: decimalToNumber(product.basePrice),
      currency: product.currency,
    })),
  };
}

export async function upsertMarketplaceVendorContract(input: {
  dataUserId: string;
  vendorId: string;
  contract: Omit<MarketplaceVendorContract, "uploadedAt"> & { uploadedAt?: string };
}): Promise<void> {
  const prefs = await loadMarketplaceVendorPreferences(input.dataUserId);
  const next = parseMarketplaceVendorPreferences({
    ...prefs,
    vendorContracts: {
      ...prefs.vendorContracts,
      [input.vendorId]: {
        ...input.contract,
        uploadedAt: input.contract.uploadedAt ?? new Date().toISOString(),
      },
    },
  });
  await saveMarketplaceVendorPreferences(input.dataUserId, next);
}

export async function submitMarketplaceVendorReview(input: {
  workspaceId: string;
  vendorId: string;
  purchaseOrderId: string;
  qualityScore: number;
  accuracyScore: number;
  deliveryScore: number;
  packagingScore: number;
  comment?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const order = await prisma.marketplacePurchaseOrder.findFirst({
    where: {
      id: input.purchaseOrderId,
      workspaceId: input.workspaceId,
      vendorId: input.vendorId,
      status: { in: ["DELIVERED", "COMPLETED"] },
      review: null,
    },
  });
  if (!order) {
    return { ok: false, error: "Order not found or already reviewed." };
  }

  const scores = [
    input.qualityScore,
    input.accuracyScore,
    input.deliveryScore,
    input.packagingScore,
  ];
  if (scores.some((score) => score < 1 || score > 5)) {
    return { ok: false, error: "Scores must be between 1 and 5." };
  }

  const overall = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);

  await prisma.marketplaceVendorReview.create({
    data: {
      vendorId: input.vendorId,
      workspaceId: input.workspaceId,
      purchaseOrderId: input.purchaseOrderId,
      qualityScore: input.qualityScore,
      accuracyScore: input.accuracyScore,
      deliveryScore: input.deliveryScore,
      packagingScore: input.packagingScore,
      overall,
      comment: input.comment ?? null,
    },
  });

  return { ok: true };
}

export async function loadLastMarketplaceOrderLinesForReorder(input: {
  workspaceId: string;
  vendorId: string;
}) {
  const order = await prisma.marketplacePurchaseOrder.findFirst({
    where: {
      workspaceId: input.workspaceId,
      vendorId: input.vendorId,
      status: { notIn: ["DRAFT", "CANCELLED"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: { select: { slug: true } },
        },
      },
      vendor: { select: { companyName: true } },
    },
  });

  if (!order) return null;

  return order.items.map((line) => ({
    productId: line.productId,
    slug: line.product.slug,
    name: line.productName,
    sku: line.sku,
    vendorId: order.vendorId,
    vendorName: order.vendor.companyName,
    quantity: line.quantity,
    unitPrice: decimalToNumber(line.unitPrice),
    currency: order.currency,
    variantId: line.variantId ?? undefined,
  }));
}
