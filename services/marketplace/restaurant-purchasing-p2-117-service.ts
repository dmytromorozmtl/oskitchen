import {
  buildRestaurantPurchasingDemoReport,
  buildRestaurantPurchasingReport,
  type RestaurantPurchasingReport,
} from "@/lib/marketplace/restaurant-purchasing-p2-117-operations";
import { RESTAURANT_PURCHASING_P2_117_POLICY_ID } from "@/lib/marketplace/restaurant-purchasing-p2-117-policy";
import { loadMarketplaceCompare } from "@/services/marketplace/marketplace-compare-service";
import { countOpenPlatformDisputes } from "@/services/marketplace/platform-dispute-resolution-service";
import { loadMarketplaceRecurringOrders } from "@/services/marketplace/recurring-orders-service";
import { prisma } from "@/lib/prisma";

export type RestaurantPurchasingSnapshot = RestaurantPurchasingReport & {
  mode: "live" | "demo";
  analyzedAt: string;
};

export async function loadRestaurantPurchasingSnapshot(input: {
  workspaceId: string | null;
}): Promise<RestaurantPurchasingSnapshot> {
  try {
    if (input.workspaceId) {
      const [compare, recurring, openDisputes, inTransitCount, backorderCount] =
        await Promise.all([
          loadMarketplaceCompare({ q: "", products: [], sort: "price_asc" }),
          loadMarketplaceRecurringOrders(input.workspaceId),
          countOpenPlatformDisputes(),
          prisma.marketplacePurchaseOrder.count({
            where: {
              workspaceId: input.workspaceId,
              status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED"] },
            },
          }),
          prisma.vendorProduct.count({
            where: {
              allowBackorder: true,
              status: "ACTIVE",
            },
          }),
        ]);

      const report = buildRestaurantPurchasingReport({
        compareOfferCount: compare.total,
        recurringOrderCount: recurring.filter((row) => row.isActive).length,
        activeSubstitutionCount: Math.min(backorderCount, 10),
        inTransitDeliveryCount: inTransitCount,
        openDisputeCount: openDisputes,
      });

      return {
        ...report,
        policyId: RESTAURANT_PURCHASING_P2_117_POLICY_ID,
        mode: "live",
        analyzedAt: new Date().toISOString(),
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const demo = buildRestaurantPurchasingDemoReport();

  return {
    ...demo,
    policyId: RESTAURANT_PURCHASING_P2_117_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
  };
}
