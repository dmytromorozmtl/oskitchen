import { differenceInCalendarDays, startOfDay } from "date-fns";

import {
  calculateInstantPayoutFee,
  evaluateInstantPayoutEligibility,
  type InstantPayoutEligibility,
} from "@/lib/marketplace/instant-payouts-policy";
import {
  isMarketplaceVendorStripeConnectEnabled,
  resolveVendorConnectStatus,
} from "@/lib/marketplace/stripe-connect-config";
import { getStripeClient, safeStripeError } from "@/lib/billing/stripe-client";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function toMinorUnits(amount: number): number {
  return Math.max(0, Math.round(amount * 100));
}

export function isMarketplaceInstantPayoutsEnabled(): boolean {
  return process.env.MARKETPLACE_INSTANT_PAYOUTS === "1";
}

export type InstantPayoutDashboard = {
  availableBalance: number;
  currency: string;
  eligibility: InstantPayoutEligibility;
  feeQuote: {
    grossAmount: number;
    feeAmount: number;
    netToDebit: number;
  } | null;
  instantPayoutsToday: number;
  standardPayoutEta: string;
  connectEnabled: boolean;
  pilotHonesty: string;
};

async function countInstantPayoutsToday(vendorId: string): Promise<number> {
  const since = startOfDay(new Date());
  const rows = await prisma.vendorTransaction.findMany({
    where: {
      vendorId,
      status: "PAID_OUT",
      payoutId: { startsWith: "INSTANT-" },
      updatedAt: { gte: since },
    },
    select: { payoutId: true },
    distinct: ["payoutId"],
  });
  return rows.length;
}

async function loadVendorInstantContext(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: {
      id: true,
      planTier: true,
      stripeAccountId: true,
      createdAt: true,
    },
  });
  if (!vendor) return null;

  const [availableAgg, gmvAgg, openDisputes, instantPayoutsToday] = await Promise.all([
    prisma.vendorTransaction.aggregate({
      where: { vendorId, status: "AVAILABLE" },
      _sum: { netAmount: true },
    }),
    prisma.vendorTransaction.aggregate({
      where: { vendorId },
      _sum: { grossAmount: true },
    }),
    prisma.marketplaceDispute.count({
      where: {
        status: { not: "RESOLVED" },
        purchaseOrder: { vendorId },
      },
    }),
    countInstantPayoutsToday(vendorId),
  ]);

  const availableBalance = decimalToNumber(availableAgg._sum.netAmount);
  const lifetimeGmvUsd = decimalToNumber(gmvAgg._sum.grossAmount);
  const accountAgeDays = differenceInCalendarDays(new Date(), vendor.createdAt);
  const connectStatus = resolveVendorConnectStatus(vendor);

  const eligibility = evaluateInstantPayoutEligibility({
    planTier: vendor.planTier,
    connectStatus,
    availableBalance,
    openDisputeCount: openDisputes,
    instantPayoutsToday,
    accountAgeDays,
    lifetimeGmvUsd,
    featureFlagEnabled: isMarketplaceInstantPayoutsEnabled(),
  });

  const feeQuote =
    eligibility.feePercent > 0 && availableBalance >= 10
      ? (() => {
          const feeAmount = calculateInstantPayoutFee(availableBalance, eligibility.feePercent);
          return {
            grossAmount: availableBalance,
            feeAmount,
            netToDebit: Math.round((availableBalance - feeAmount) * 100) / 100,
          };
        })()
      : null;

  return {
    vendor,
    availableBalance,
    eligibility,
    feeQuote,
    instantPayoutsToday,
  };
}

export async function loadInstantPayoutDashboard(vendorId: string): Promise<InstantPayoutDashboard> {
  const ctx = await loadVendorInstantContext(vendorId);
  if (!ctx) {
    return {
      availableBalance: 0,
      currency: "USD",
      eligibility: {
        eligible: false,
        reasons: ["Vendor not found."],
        feePercent: 0,
        estimatedMinutes: 30,
      },
      feeQuote: null,
      instantPayoutsToday: 0,
      standardPayoutEta: "2–5 business days to bank after manual payout",
      connectEnabled: isMarketplaceVendorStripeConnectEnabled(),
      pilotHonesty:
        "Instant debit payouts are a Growth+ feature (~30 min). Standard Connect transfers remain manual.",
    };
  }

  return {
    availableBalance: ctx.availableBalance,
    currency: "USD",
    eligibility: ctx.eligibility,
    feeQuote: ctx.feeQuote,
    instantPayoutsToday: ctx.instantPayoutsToday,
    standardPayoutEta: "2–5 business days to bank (Stripe default schedule)",
    connectEnabled: isMarketplaceVendorStripeConnectEnabled(),
    pilotHonesty:
      "Funds move to your Stripe Express balance first, then instant payout to your debit card. Fee shown before you confirm.",
  };
}

export async function requestInstantVendorPayout(vendorId: string): Promise<
  | {
      ok: true;
      payoutId: string;
      amount: number;
      feeAmount: number;
      netAmount: number;
      stripePayoutId?: string;
      transferId?: string;
      mode: "instant";
    }
  | { ok: false; error: string }
> {
  const ctx = await loadVendorInstantContext(vendorId);
  if (!ctx) return { ok: false, error: "Vendor not found." };
  if (!ctx.eligibility.eligible || !ctx.feeQuote) {
    return {
      ok: false,
      error: ctx.eligibility.reasons[0] ?? "Instant payout is not available.",
    };
  }

  const payoutId = `INSTANT-${Date.now().toString(36).toUpperCase()}`;
  const { grossAmount, feeAmount, netToDebit } = ctx.feeQuote;

  const available = await prisma.vendorTransaction.findMany({
    where: { vendorId, status: "AVAILABLE" },
    select: { id: true },
  });
  if (available.length === 0) {
    return { ok: false, error: "No available balance to pay out." };
  }

  const vendor = ctx.vendor;
  const stripe = getStripeClient();
  if (
    !stripe ||
    !isMarketplaceVendorStripeConnectEnabled() ||
    !isMarketplaceInstantPayoutsEnabled() ||
    !vendor.stripeAccountId?.trim()
  ) {
    return {
      ok: false,
      error: "Stripe instant payout is not configured in this environment.",
    };
  }

  let transferId: string | undefined;
  let stripePayoutId: string | undefined;

  {
    try {
      const transfer = await stripe.transfers.create({
        amount: toMinorUnits(grossAmount),
        currency: "usd",
        destination: vendor.stripeAccountId,
        metadata: { payoutId, vendorId, type: "instant_prefund" },
      });
      transferId = transfer.id;

      const payout = await stripe.payouts.create(
        {
          amount: toMinorUnits(netToDebit),
          currency: "usd",
          method: "instant",
          metadata: {
            payoutId,
            vendorId,
            kitchenosFeeUsd: String(feeAmount),
          },
        },
        { stripeAccount: vendor.stripeAccountId },
      );
      stripePayoutId = payout.id;
    } catch (error) {
      logger.error("[instant-payouts] stripe instant payout failed", error);
      return { ok: false, error: safeStripeError(error) };
    }
  }

  await prisma.vendorTransaction.updateMany({
    where: { id: { in: available.map((row) => row.id) } },
    data: { status: "PAID_OUT", payoutId },
  });

  return {
    ok: true,
    payoutId,
    amount: grossAmount,
    feeAmount,
    netAmount: netToDebit,
    stripePayoutId,
    transferId,
    mode: "instant",
  };
}
