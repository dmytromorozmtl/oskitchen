import { addDays } from "date-fns";

import {
  MARKETPLACE_EARLY_PAYMENT_DISCOUNT_PERCENT,
  MARKETPLACE_EARLY_PAYMENT_WINDOW_DAYS,
  MARKETPLACE_FINANCING_PATH,
  MARKETPLACE_FINANCING_POLICY_ID,
  MARKETPLACE_NET_TERMS_OPTIONS,
  type MarketplaceNetTermsDays,
} from "@/lib/marketplace/financing-policy";
import type {
  MarketplaceEarlyPaymentOffer,
  MarketplaceFactoringOffer,
  MarketplaceFinancingSnapshot,
  MarketplaceFinancingTermProduct,
} from "@/lib/marketplace/financing-types";
import type { MarketplacePaymentSchedule } from "@/lib/marketplace/capital-integration-types";

export function buildNetTermsTermProducts(input: {
  activeDays: number;
  gmv90Usd: number;
  capitalFunded: boolean;
}): MarketplaceFinancingTermProduct[] {
  return MARKETPLACE_NET_TERMS_OPTIONS.map((days) => {
    const eligible =
      days === 30
        ? true
        : days === 60
          ? input.gmv90Usd >= 5000 || input.capitalFunded
          : input.gmv90Usd >= 15000 || input.capitalFunded;

    const requirement =
      days === 30
        ? "Available on approved marketplace credit line"
        : days === 60
          ? "Requires $5k+ 90-day GMV or capital partner funding"
          : "Requires $15k+ 90-day GMV or capital partner funding";

    return {
      days,
      label: `Net-${days}`,
      description:
        days === 30
          ? "Standard supplier terms — pay vendors after delivery."
          : days === 60
            ? "Extended cash flow for growing operators."
            : "Maximum float for high-volume procurement.",
      eligible,
      requirement,
      isActive: input.activeDays === days,
    };
  });
}

export function buildEarlyPaymentOffers(
  schedules: MarketplacePaymentSchedule[],
  now = new Date(),
): MarketplaceEarlyPaymentOffer[] {
  const offers: MarketplaceEarlyPaymentOffer[] = [];

  for (const schedule of schedules) {
    const payBy = addDays(new Date(schedule.createdAt), MARKETPLACE_EARLY_PAYMENT_WINDOW_DAYS);
    for (const entry of schedule.entries) {
      if (entry.status !== "scheduled") continue;
      const discountUsd =
        Math.round(entry.amountUsd * (MARKETPLACE_EARLY_PAYMENT_DISCOUNT_PERCENT / 100) * 100) / 100;
      const expired = now > payBy;
      offers.push({
        id: `${schedule.id}-${entry.orderId}`,
        scheduleId: schedule.id,
        orderId: entry.orderId,
        poNumber: entry.poNumber,
        dueDateIso: entry.dueDate,
        amountUsd: entry.amountUsd,
        discountPercent: MARKETPLACE_EARLY_PAYMENT_DISCOUNT_PERCENT,
        discountUsd,
        payByIso: payBy.toISOString(),
        status: expired ? "expired" : "available",
      });
    }
  }

  return offers.sort((a, b) => b.discountUsd - a.discountUsd).slice(0, 8);
}

export function buildFactoringOffers(input: {
  receivablesUsd: number;
  partners: Array<{
    slug: string;
    name: string;
    title: string;
    deepLink: string | null;
    advanceRatePercent: number;
    feePercent: number;
  }>;
}): MarketplaceFactoringOffer[] {
  if (input.receivablesUsd <= 0) return [];

  return input.partners.map((partner) => {
    const advanceUsd = Math.round(input.receivablesUsd * (partner.advanceRatePercent / 100) * 100) / 100;
    return {
      id: `factoring-${partner.slug}`,
      partnerSlug: partner.slug,
      partnerName: partner.name,
      title: partner.title,
      receivablesUsd: input.receivablesUsd,
      advanceRatePercent: partner.advanceRatePercent,
      advanceUsd,
      feePercent: partner.feePercent,
      deepLink: partner.deepLink,
    };
  });
}

export function buildMarketplaceFinancingSnapshot(input: {
  workspaceId: string;
  currency: string;
  creditLine: MarketplaceFinancingSnapshot["creditLine"];
  termProducts: MarketplaceFinancingTermProduct[];
  earlyPaymentOffers: MarketplaceEarlyPaymentOffer[];
  factoringOffers: MarketplaceFactoringOffer[];
  analyzedAt?: Date;
}): MarketplaceFinancingSnapshot {
  const earlyPaymentSavingsUsd = input.earlyPaymentOffers
    .filter((row) => row.status === "available")
    .reduce((sum, row) => sum + row.discountUsd, 0);

  const activeTerm = input.termProducts.find((row) => row.isActive);

  return {
    policyId: MARKETPLACE_FINANCING_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    currency: input.currency,
    creditLine: input.creditLine,
    termProducts: input.termProducts,
    earlyPaymentOffers: input.earlyPaymentOffers,
    factoringOffers: input.factoringOffers,
    summary: {
      openSchedules: input.earlyPaymentOffers.length,
      earlyPaymentSavingsUsd: Math.round(earlyPaymentSavingsUsd * 100) / 100,
      factoringEligibleUsd: input.factoringOffers[0]?.receivablesUsd ?? 0,
      activeTermLabel: activeTerm?.label ?? "Net-30",
    },
    basePath: MARKETPLACE_FINANCING_PATH,
  };
}
