import type { BusinessType, MarketplacePOStatus } from "@prisma/client";
import { startOfMonth } from "date-fns";

import { prisma } from "@/lib/prisma";

const ACTIVE_ORDER_STATUSES: MarketplacePOStatus[] = [
  "PENDING_APPROVAL",
  "SUBMITTED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "DISPUTED",
];

const ATTENTION_STATUSES: MarketplacePOStatus[] = [
  "PENDING_APPROVAL",
  "DISPUTED",
  "SUBMITTED",
];

export type MarketplaceDashboardPromotion = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
};

export type MarketplaceOrderAgainItem = {
  orderId: string;
  productId: string;
  productName: string;
  vendorName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  slug: string;
  lastOrderedAt: string;
};

export type MarketplaceFeaturedVendor = {
  id: string;
  companyName: string;
  type: string;
  productCount: number;
  avgRating: number | null;
};

export type MarketplaceProductCard = {
  id: string;
  name: string;
  slug: string;
  vendorName: string;
  basePrice: number;
  currency: string;
  priceUnit: string;
  leadTimeDays: number;
  inStock: boolean;
};

export type MarketplacePendingAction = {
  id: string;
  kind: "approval" | "delivery" | "dispute" | "recurring";
  title: string;
  description: string;
  href: string;
};

export type MarketplaceDashboardModel = {
  spendThisMonth: number;
  activeOrderCount: number;
  vendorCount: number;
  attentionCount: number;
  currency: string;
  promotions: MarketplaceDashboardPromotion[];
  orderAgain: MarketplaceOrderAgainItem[];
  recommendations: MarketplaceProductCard[];
  featuredVendors: MarketplaceFeaturedVendor[];
  popularInRegion: MarketplaceProductCard[];
  newArrivals: MarketplaceProductCard[];
  pendingActions: MarketplacePendingAction[];
  categoryCount: number;
};

const BUSINESS_TYPE_CATEGORY_SLUGS: Partial<Record<BusinessType, readonly string[]>> = {
  RESTAURANT: ["kitchenware-tools", "dry-goods", "packaging-disposables", "cleaning-sanitation"],
  CAFE: ["packaging-disposables", "dry-goods", "equipment", "kitchenware-tools"],
  BAKERY: ["dry-goods", "packaging-disposables", "kitchenware-tools", "equipment"],
  CATERING: ["packaging-disposables", "kitchenware-tools", "equipment", "uniforms"],
  MEAL_PREP: ["packaging-disposables", "dry-goods", "cleaning-sanitation", "kitchenware-tools"],
  BAR: ["dry-goods", "packaging-disposables", "equipment", "cleaning-sanitation"],
  GHOST_KITCHEN: ["packaging-disposables", "equipment", "cleaning-sanitation", "services"],
  CLOUD_KITCHEN: ["packaging-disposables", "equipment", "cleaning-sanitation", "services"],
  MULTI_BRAND: ["packaging-disposables", "equipment", "dry-goods", "services"],
  OTHER: ["packaging-disposables", "cleaning-sanitation", "dry-goods", "kitchenware-tools"],
};

export function recommendationCategorySlugsForBusinessType(
  businessType: BusinessType | null | undefined,
): readonly string[] {
  if (!businessType) {
    return BUSINESS_TYPE_CATEGORY_SLUGS.OTHER ?? ["packaging-disposables", "dry-goods"];
  }
  return BUSINESS_TYPE_CATEGORY_SLUGS[businessType] ?? BUSINESS_TYPE_CATEGORY_SLUGS.OTHER ?? [];
}

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function mapProductCard(product: {
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
}): MarketplaceProductCard {
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
  };
}

export async function loadMarketplaceDashboard(
  workspaceId: string,
  businessType: BusinessType | null | undefined,
): Promise<MarketplaceDashboardModel> {
  const monthStart = startOfMonth(new Date());
  const deliveryWindowEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const [
    spendAgg,
    activeOrderCount,
    vendorCount,
    attentionCount,
    categoryCount,
    recentOrders,
    featuredVendorsRaw,
    popularProducts,
    newProducts,
    pendingApprovalOrders,
    upcomingDeliveries,
    openDisputes,
    dueRecurring,
  ] = await Promise.all([
    prisma.marketplacePurchaseOrder.aggregate({
      where: {
        workspaceId,
        createdAt: { gte: monthStart },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      _sum: { total: true },
    }),
    prisma.marketplacePurchaseOrder.count({
      where: { workspaceId, status: { in: ACTIVE_ORDER_STATUSES } },
    }),
    prisma.marketplacePurchaseOrder.groupBy({
      by: ["vendorId"],
      where: {
        workspaceId,
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
    }).then((rows) => rows.length),
    prisma.marketplacePurchaseOrder.count({
      where: { workspaceId, status: { in: ATTENTION_STATUSES } },
    }),
    prisma.marketplaceProductCategory.count({ where: { level: 1 } }),
    prisma.marketplacePurchaseOrder.findMany({
      where: {
        workspaceId,
        status: { in: ["DELIVERED", "COMPLETED", "SHIPPED", "PROCESSING", "CONFIRMED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        items: {
          take: 1,
          include: {
            product: { select: { slug: true } },
          },
        },
        vendor: { select: { companyName: true } },
      },
    }),
    prisma.vendor.findMany({
      where: { status: "APPROVED" },
      orderBy: { verifiedAt: "desc" },
      take: 4,
      include: {
        _count: { select: { products: true } },
        reviews: { select: { overall: true }, take: 20 },
      },
    }),
    prisma.vendorProduct.findMany({
      where: { status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: { vendor: { select: { companyName: true } } },
    }),
    prisma.vendorProduct.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { vendor: { select: { companyName: true } } },
    }),
    prisma.marketplacePurchaseOrder.findMany({
      where: { workspaceId, status: "PENDING_APPROVAL" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { vendor: { select: { companyName: true } } },
    }),
    prisma.marketplacePurchaseOrder.findMany({
      where: {
        workspaceId,
        status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED"] },
        confirmedDeliveryDate: { lte: deliveryWindowEnd },
      },
      orderBy: { confirmedDeliveryDate: "asc" },
      take: 3,
      include: { vendor: { select: { companyName: true } } },
    }),
    prisma.marketplaceDispute.findMany({
      where: { status: { in: ["OPEN", "VENDOR_RESPONSE", "ADMIN_REVIEW"] } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        purchaseOrder: {
          select: { workspaceId: true, vendor: { select: { companyName: true } } },
        },
      },
    }),
    prisma.marketplaceRecurringOrder.findMany({
      where: {
        workspaceId,
        isActive: true,
        nextRunAt: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { nextRunAt: "asc" },
      take: 3,
      include: { vendor: { select: { companyName: true } } },
    }),
  ]);

  const recommendationSlugs = recommendationCategorySlugsForBusinessType(businessType);
  const recommendationProducts =
    recommendationSlugs.length > 0
      ? await prisma.vendorProduct.findMany({
          where: {
            status: "ACTIVE",
            category: { slug: { in: [...recommendationSlugs] } },
          },
          orderBy: { updatedAt: "desc" },
          take: 6,
          include: { vendor: { select: { companyName: true } } },
        })
      : popularProducts.slice(0, 6);

  const orderAgain: MarketplaceOrderAgainItem[] = recentOrders.flatMap((order) => {
    const line = order.items[0];
    if (!line) return [];
    return [
      {
        orderId: order.id,
        productId: line.productId,
        productName: line.productName,
        vendorName: order.vendor.companyName,
        sku: line.sku,
        quantity: line.quantity,
        unitPrice: decimalToNumber(line.unitPrice),
        slug: line.product.slug,
        lastOrderedAt: order.createdAt.toISOString(),
      },
    ];
  });

  const featuredVendors: MarketplaceFeaturedVendor[] = featuredVendorsRaw.map((vendor) => {
    const ratings = vendor.reviews.map((review) => review.overall);
    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10
        : null;
    return {
      id: vendor.id,
      companyName: vendor.companyName,
      type: vendor.type,
      productCount: vendor._count.products,
      avgRating,
    };
  });

  const pendingActions: MarketplacePendingAction[] = [
    ...pendingApprovalOrders.map((order) => ({
      id: `approval-${order.id}`,
      kind: "approval" as const,
      title: "Purchase order needs approval",
      description: `${order.vendor.companyName} · ${formatMoney(decimalToNumber(order.total), order.currency)}`,
      href: `/dashboard/marketplace/orders/${order.id}`,
    })),
    ...upcomingDeliveries.map((order) => ({
      id: `delivery-${order.id}`,
      kind: "delivery" as const,
      title: "Delivery arriving soon",
      description: `${order.vendor.companyName}${order.confirmedDeliveryDate ? ` · ${order.confirmedDeliveryDate.toLocaleDateString()}` : ""}`,
      href: `/dashboard/marketplace/orders/${order.id}`,
    })),
    ...openDisputes
      .filter((dispute) => dispute.purchaseOrder.workspaceId === workspaceId)
      .map((dispute) => ({
        id: `dispute-${dispute.id}`,
        kind: "dispute" as const,
        title: "Open dispute",
        description: `${dispute.purchaseOrder.vendor.companyName} · ${dispute.reason.replace(/_/g, " ").toLowerCase()}`,
        href: `/dashboard/marketplace/orders/${dispute.purchaseOrderId}`,
      })),
    ...dueRecurring.map((recurring) => ({
      id: `recurring-${recurring.id}`,
      kind: "recurring" as const,
      title: "Recurring order due",
      description: `${recurring.name} · ${recurring.vendor.companyName} · ${recurring.nextRunAt.toLocaleDateString()}`,
      href: "/dashboard/marketplace/orders?tab=recurring",
    })),
  ].slice(0, 8);

  const promotions: MarketplaceDashboardPromotion[] = [
    {
      id: "promo-catalog",
      title: "Browse HoReCa catalog",
      subtitle: `${categoryCount} top-level categories · verified vendors`,
      href: "/dashboard/marketplace/catalog",
      badge: "Discover",
    },
    {
      id: "promo-vendors",
      title: "Featured vendor week",
      subtitle: featuredVendors[0]
        ? `${featuredVendors[0].companyName} — ${featuredVendors[0].productCount} SKUs`
        : "New verified suppliers joining weekly",
      href: featuredVendors[0]
        ? `/dashboard/marketplace/vendors/${featuredVendors[0].id}`
        : "/dashboard/marketplace/vendors",
      badge: "Featured",
    },
    {
      id: "promo-compare",
      title: "Compare prices across vendors",
      subtitle: "Same SKU, best MOQ and delivery time",
      href: "/dashboard/marketplace/compare",
      badge: "Save",
    },
  ];

  return {
    spendThisMonth: decimalToNumber(spendAgg._sum.total),
    activeOrderCount,
    vendorCount,
    attentionCount,
    currency: "USD",
    promotions,
    orderAgain,
    recommendations: recommendationProducts.map(mapProductCard),
    featuredVendors,
    popularInRegion: popularProducts.slice(0, 6).map(mapProductCard),
    newArrivals: newProducts.map(mapProductCard),
    pendingActions,
    categoryCount,
  };
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
