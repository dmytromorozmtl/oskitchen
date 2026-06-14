import {
  buildVendorAnalyticsDemoReport,
  buildVendorAnalyticsReport,
  type VendorAnalyticsReport,
} from "@/lib/marketplace/vendor-analytics-p2-119-operations";
import { VENDOR_ANALYTICS_P2_119_POLICY_ID } from "@/lib/marketplace/vendor-analytics-p2-119-policy";
import type { MarketplaceCartItem } from "@/services/marketplace/cart-service";
import { loadVendorAnalytics } from "@/services/marketplace/vendor-analytics-service";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export type VendorAnalyticsSnapshot = VendorAnalyticsReport & {
  mode: "live" | "demo";
  analyzedAt: string;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function parseCartItems(raw: unknown): MarketplaceCartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is MarketplaceCartItem =>
      typeof item === "object" &&
      item != null &&
      typeof (item as MarketplaceCartItem).vendorId === "string",
  );
}

async function countLostCartsForVendor(vendorId: string): Promise<{
  lostCartCount: number;
  lostCartValueUsd: number;
}> {
  const periodStart = subDays(new Date(), 30);

  const [draftOrders, carts] = await Promise.all([
    prisma.marketplacePurchaseOrder.findMany({
      where: {
        vendorId,
        status: "DRAFT",
        createdAt: { gte: periodStart },
      },
      select: { total: true },
    }),
    prisma.marketplaceCart.findMany({
      select: { items: true },
    }),
  ]);

  let cartLineCount = 0;
  let cartValueUsd = 0;

  for (const cart of carts) {
    for (const item of parseCartItems(cart.items)) {
      if (item.vendorId !== vendorId) continue;
      cartLineCount += 1;
      cartValueUsd += item.unitPrice * item.quantity;
    }
  }

  const draftCount = draftOrders.length;
  const draftValueUsd = draftOrders.reduce(
    (sum, order) => sum + decimalToNumber(order.total),
    0,
  );

  return {
    lostCartCount: draftCount + cartLineCount,
    lostCartValueUsd: Math.round((draftValueUsd + cartValueUsd) * 100) / 100,
  };
}

async function countPriceCompetitiveness(vendorId: string): Promise<{
  competitiveSkuCount: number;
  uncompetitiveSkuCount: number;
}> {
  const vendorProducts = await prisma.vendorProduct.findMany({
    where: { vendorId, status: "ACTIVE", gtin: { not: null } },
    select: { gtin: true, basePrice: true },
  });

  if (vendorProducts.length === 0) {
    return { competitiveSkuCount: 0, uncompetitiveSkuCount: 0 };
  }

  const gtins = [...new Set(vendorProducts.map((product) => product.gtin).filter(Boolean))] as string[];

  const peers = await prisma.vendorProduct.findMany({
    where: { status: "ACTIVE", gtin: { in: gtins } },
    select: { gtin: true, basePrice: true, vendorId: true },
  });

  const minPriceByGtin = new Map<string, number>();
  for (const peer of peers) {
    if (!peer.gtin) continue;
    const price = decimalToNumber(peer.basePrice);
    const current = minPriceByGtin.get(peer.gtin);
    if (current == null || price < current) {
      minPriceByGtin.set(peer.gtin, price);
    }
  }

  let competitiveSkuCount = 0;
  let uncompetitiveSkuCount = 0;

  for (const product of vendorProducts) {
    if (!product.gtin) continue;
    const minPrice = minPriceByGtin.get(product.gtin);
    const price = decimalToNumber(product.basePrice);
    if (minPrice == null) continue;
    if (Math.abs(price - minPrice) < 0.01) {
      competitiveSkuCount += 1;
    } else {
      uncompetitiveSkuCount += 1;
    }
  }

  return { competitiveSkuCount, uncompetitiveSkuCount };
}

export async function loadVendorAnalyticsSnapshot(input: {
  workspaceId: string | null;
}): Promise<VendorAnalyticsSnapshot> {
  try {
    if (input.workspaceId) {
      const vendor = await prisma.vendor.findFirst({
        where: { workspaceId: input.workspaceId },
        orderBy: { updatedAt: "desc" },
        select: { id: true },
      });

      if (vendor) {
        const [analytics, lostCarts, priceComp] = await Promise.all([
          loadVendorAnalytics(vendor.id),
          countLostCartsForVendor(vendor.id),
          countPriceCompetitiveness(vendor.id),
        ]);

        const topProduct = analytics.productPerformance[0];
        const repeatBuyerCount = analytics.customerSegments.find(
          (segment) => segment.segment === "Repeat buyers",
        )?.buyers ?? 0;

        const report = buildVendorAnalyticsReport({
          topProductCount: analytics.productPerformance.length,
          topProductRevenueUsd: topProduct?.revenue ?? 0,
          repeatBuyerRatePct: analytics.repeatBuyerRate,
          repeatBuyerCount,
          lostCartCount: lostCarts.lostCartCount,
          lostCartValueUsd: lostCarts.lostCartValueUsd,
          competitiveSkuCount: priceComp.competitiveSkuCount,
          uncompetitiveSkuCount: priceComp.uncompetitiveSkuCount,
        });

        return {
          ...report,
          policyId: VENDOR_ANALYTICS_P2_119_POLICY_ID,
          mode: "live",
          analyzedAt: new Date().toISOString(),
        };
      }
    }
  } catch {
    // Fall through to demo fixture
  }

  const demo = buildVendorAnalyticsDemoReport();

  return {
    ...demo,
    policyId: VENDOR_ANALYTICS_P2_119_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
  };
}
