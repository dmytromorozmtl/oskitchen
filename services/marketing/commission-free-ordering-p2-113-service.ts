import {
  buildCommissionFreeOrderingDemoReport,
  buildCommissionFreeOrderingReport,
  type CommissionFreeOrderingReport,
} from "@/lib/marketing/commission-free-ordering-p2-113-operations";
import { COMMISSION_FREE_ORDERING_P2_113_POLICY_ID } from "@/lib/marketing/commission-free-ordering-p2-113-policy";
import { stripeReadinessSummary } from "@/lib/storefront/stripe-readiness";
import { prisma } from "@/lib/prisma";
import { storefrontSettingsListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { storefrontPaymentReadiness } from "@/services/storefront/storefront-payment-service";

export type CommissionFreeOrderingSnapshot = CommissionFreeOrderingReport & {
  mode: "live" | "demo";
  checkoutAllowed: boolean;
  analyzedAt: string;
};

export async function loadCommissionFreeOrderingSnapshot(
  userId: string,
): Promise<CommissionFreeOrderingSnapshot> {
  try {
    const settings = await prisma.storefrontSettings.findFirst({
      where: await storefrontSettingsListWhereForOwner(userId),
      orderBy: { updatedAt: "desc" },
    });

    if (settings) {
      const stripe = stripeReadinessSummary();
      const pay = storefrontPaymentReadiness(settings);

      const report = buildCommissionFreeOrderingReport({
        osKitchenOrderCommissionPct: 0,
        stripeProcessingPct: 2.9,
        stripeFixedFeeUsd: 0.3,
        marketplaceCommissionPct: 25,
        monthlyOrderVolumeUsd: 12000,
        orderCount: 400,
        stripeReady: stripe.ready,
        stripeMode: stripe.mode,
      });

      return {
        ...report,
        policyId: COMMISSION_FREE_ORDERING_P2_113_POLICY_ID,
        mode: "live",
        checkoutAllowed: pay.allowed,
        analyzedAt: new Date().toISOString(),
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const report = buildCommissionFreeOrderingDemoReport();

  return {
    ...report,
    policyId: COMMISSION_FREE_ORDERING_P2_113_POLICY_ID,
    mode: "demo",
    checkoutAllowed: false,
    analyzedAt: new Date().toISOString(),
  };
}
