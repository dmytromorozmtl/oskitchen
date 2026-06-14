import {
  buildVendorPayoutWebhookDemoReport,
  buildVendorPayoutWebhookReport,
  type VendorPayoutWebhookReport,
} from "@/lib/marketplace/vendor-payout-webhook-p2-121-operations";
import { VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID } from "@/lib/marketplace/vendor-payout-webhook-p2-121-policy";
import { MARKETPLACE_CONNECT_WEBHOOK_EVENTS } from "@/lib/marketplace/stripe-connect-config";
import {
  refreshVendorConnectReadiness,
  vendorConnectReadiness,
} from "@/services/marketplace/stripe-connect-service";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export type VendorPayoutWebhookSnapshot = VendorPayoutWebhookReport & {
  mode: "live" | "demo";
  analyzedAt: string;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

export async function loadVendorPayoutWebhookSnapshot(input: {
  workspaceId: string | null;
}): Promise<VendorPayoutWebhookSnapshot> {
  try {
    if (input.workspaceId) {
      const vendor = await prisma.vendor.findFirst({
        where: { workspaceId: input.workspaceId },
        orderBy: { updatedAt: "desc" },
        select: { id: true, stripeAccountId: true },
      });

      if (vendor) {
        const periodStart = subDays(new Date(), 30);

        const [connect, availableAgg, paidOutRows, webhookDeliveries] = await Promise.all([
          refreshVendorConnectReadiness(vendor.id),
          prisma.vendorTransaction.aggregate({
            where: { vendorId: vendor.id, status: "AVAILABLE" },
            _sum: { netAmount: true },
          }),
          prisma.vendorTransaction.findMany({
            where: {
              vendorId: vendor.id,
              status: "PAID_OUT",
              payoutId: { not: null },
              updatedAt: { gte: periodStart },
            },
            select: { payoutId: true },
            distinct: ["payoutId"],
          }),
          prisma.billingEvent.count({
            where: {
              workspaceId: input.workspaceId,
              source: "stripe",
              eventType: { startsWith: "MARKETPLACE_CONNECT_" },
              createdAt: { gte: periodStart },
            },
          }),
        ]);

        const readiness = vendorConnectReadiness(vendor);
        const connectReady = connect.ready ?? readiness.ready;

        const report = buildVendorPayoutWebhookReport({
          connectReady,
          connectStatus: connect.status ?? readiness.status,
          availableBalanceUsd: decimalToNumber(availableAgg._sum.netAmount),
          paidOutCount30d: paidOutRows.length,
          webhookEventTypeCount: MARKETPLACE_CONNECT_WEBHOOK_EVENTS.length,
          connectWebhookDeliveries30d: webhookDeliveries,
        });

        return {
          ...report,
          policyId: VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID,
          mode: "live",
          analyzedAt: new Date().toISOString(),
        };
      }
    }
  } catch {
    // Fall through to demo fixture
  }

  const demo = buildVendorPayoutWebhookDemoReport();

  return {
    ...demo,
    policyId: VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
  };
}
