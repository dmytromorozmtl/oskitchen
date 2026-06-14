import {
  buildMarketplaceEmptyStatesP2_123DemoReport,
  buildMarketplaceEmptyStatesP2_123Report,
  type MarketplaceEmptyStatesP2_123Report,
} from "@/lib/marketplace/marketplace-empty-states-p2-123-operations";
import { MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID } from "@/lib/marketplace/marketplace-empty-states-p2-123-policy";
import { prisma } from "@/lib/prisma";

export type MarketplaceEmptyStatesP2_123Snapshot = MarketplaceEmptyStatesP2_123Report & {
  mode: "live" | "demo";
  analyzedAt: string;
};

export async function loadMarketplaceEmptyStatesP2_123Snapshot(input: {
  workspaceId: string | null;
}): Promise<MarketplaceEmptyStatesP2_123Snapshot> {
  try {
    if (input.workspaceId) {
      const [productCount, orderCount, orderVendorIds] = await Promise.all([
        prisma.vendorProduct.count({
          where: { status: "ACTIVE", vendor: { status: "APPROVED" } },
        }),
        prisma.marketplacePurchaseOrder.count({
          where: { workspaceId: input.workspaceId },
        }),
        prisma.marketplacePurchaseOrder.groupBy({
          by: ["vendorId"],
          where: {
            workspaceId: input.workspaceId,
            status: { notIn: ["DRAFT", "CANCELLED"] },
          },
        }),
      ]);

      const report = buildMarketplaceEmptyStatesP2_123Report({
        productCount,
        orderCount,
        vendorCount: orderVendorIds.length,
        catalogWired: true,
        ordersWired: true,
        vendorsWired: true,
      });

      return {
        ...report,
        policyId: MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID,
        mode: "live",
        analyzedAt: new Date().toISOString(),
      };
    }
  } catch {
    // Fall through to demo fixture when DB unavailable.
  }

  return {
    ...buildMarketplaceEmptyStatesP2_123DemoReport(),
    policyId: MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
  };
}
