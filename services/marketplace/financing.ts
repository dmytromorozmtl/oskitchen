import { subDays } from "date-fns";
import type { Prisma } from "@prisma/client";

import {
  buildEarlyPaymentOffers,
  buildFactoringOffers,
  buildMarketplaceFinancingSnapshot,
  buildNetTermsTermProducts,
} from "@/lib/marketplace/financing-builders";
import { MARKETPLACE_FACTORING_MIN_EXPOSURE_USD } from "@/lib/marketplace/financing-policy";
import type { MarketplaceNetTermsDays } from "@/lib/marketplace/financing-policy";
import type { MarketplaceFinancingSnapshot } from "@/lib/marketplace/financing-types";
import {
  marketplaceCapitalFromSettingsCenter,
  mergeMarketplaceCapitalIntoSettingsCenter,
} from "@/lib/marketplace/capital-integration-types";
import { listLenderOfferPartners } from "@/lib/commercial/capital-partners";
import { prisma } from "@/lib/prisma";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { resolveCapitalRegionForOwner } from "@/services/commercial/capital-multi-lender-service";
import {
  getCreditLine,
  listMarketplacePaymentSchedules,
} from "@/services/marketplace/capital-integration-service";

export type { MarketplaceFinancingSnapshot } from "@/lib/marketplace/financing-types";

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

async function loadGmv90(workspaceId: string): Promise<number> {
  const since = subDays(new Date(), 90);
  const agg = await prisma.marketplacePurchaseOrder.aggregate({
    where: {
      workspaceId,
      createdAt: { gte: since },
      status: { notIn: ["DRAFT", "CANCELLED"] },
    },
    _sum: { total: true },
  });
  return decimalToNumber(agg._sum.total);
}

async function loadCapitalFunded(userId: string): Promise<boolean> {
  const count = await prisma.capitalPartnerReferral.count({
    where: { userId, status: "FUNDED" },
  });
  return count > 0;
}

async function loadOpenNetTermsReceivables(workspaceId: string): Promise<number> {
  const agg = await prisma.marketplacePurchaseOrder.aggregate({
    where: {
      workspaceId,
      paymentMethod: "NET_TERMS",
      status: {
        in: ["SUBMITTED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "PENDING_APPROVAL"],
      },
    },
    _sum: { total: true },
  });
  return decimalToNumber(agg._sum.total);
}

export async function loadMarketplaceFinancingSnapshot(input: {
  workspaceId: string;
  userId: string;
}): Promise<MarketplaceFinancingSnapshot> {
  const [creditLine, schedules, gmv90Usd, capitalFunded, receivablesUsd, region] = await Promise.all([
    getCreditLine({ workspaceId: input.workspaceId, userId: input.userId }),
    listMarketplacePaymentSchedules(input.userId),
    loadGmv90(input.workspaceId),
    loadCapitalFunded(input.userId),
    loadOpenNetTermsReceivables(input.workspaceId),
    resolveCapitalRegionForOwner(input.userId),
  ]);

  const termProducts = buildNetTermsTermProducts({
    activeDays: creditLine.netTermsDays,
    gmv90Usd,
    capitalFunded,
  });

  const earlyPaymentOffers = buildEarlyPaymentOffers(schedules);

  const factoringPartners = listLenderOfferPartners({ region })
    .filter((partner) => partner.slug.includes("factoring") || partner.slug.includes("receivable"))
    .slice(0, 3);

  const defaultFactoringPartners =
    factoringPartners.length > 0
      ? factoringPartners.map((partner) => ({
          slug: partner.slug,
          name: partner.name,
          title: partner.offerProgramName ?? `${partner.name} invoice factoring`,
          deepLink: partner.offerApplyUrlTemplate ?? partner.href ?? null,
          advanceRatePercent: 88,
          feePercent: 2.5,
        }))
      : [
          {
            slug: "marketplace-factoring-standard",
            name: "KitchenOS Capital",
            title: "Marketplace receivables factoring",
            deepLink: "/dashboard/analytics/capital",
            advanceRatePercent: 85,
            feePercent: 3,
          },
        ];

  const factoringOffers =
    receivablesUsd >= MARKETPLACE_FACTORING_MIN_EXPOSURE_USD
      ? buildFactoringOffers({
          receivablesUsd,
          partners: defaultFactoringPartners,
        })
      : [];

  return buildMarketplaceFinancingSnapshot({
    workspaceId: input.workspaceId,
    currency: "USD",
    creditLine: {
      limitUsd: creditLine.limitUsd,
      usedUsd: creditLine.usedUsd,
      availableUsd: creditLine.availableUsd,
      activeNetTermsDays: creditLine.netTermsDays,
      source: creditLine.source,
    },
    termProducts,
    earlyPaymentOffers,
    factoringOffers,
  });
}

export async function setMarketplaceNetTermsDays(
  workspaceId: string,
  days: MarketplaceNetTermsDays,
): Promise<void> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const snapshot = await loadMarketplaceFinancingSnapshot({
    workspaceId,
    userId: ownerUserId,
  });
  const term = snapshot.termProducts.find((row) => row.days === days);
  if (!term?.eligible) {
    throw new Error(`Net-${days} is not eligible for this workspace.`);
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const capital = marketplaceCapitalFromSettingsCenter(kitchen?.settingsCenterJson);
  const next = mergeMarketplaceCapitalIntoSettingsCenter(kitchen?.settingsCenterJson, {
    ...capital,
    netTermsDays: days,
  });

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: { userId: ownerUserId, settingsCenterJson: next as Prisma.InputJsonValue },
    update: { settingsCenterJson: next as Prisma.InputJsonValue },
  });
}
