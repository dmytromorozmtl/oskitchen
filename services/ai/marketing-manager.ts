import { subDays } from "date-fns";

import { buildMarketingManagerSnapshot } from "@/lib/ai/marketing-manager-builders";
import { AI_MARKETING_CHURN_WINBACK_THRESHOLD, AI_MARKETING_LOOKBACK_DAYS } from "@/lib/ai/marketing-manager-policy";
import { prisma } from "@/lib/prisma";
import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  holidayPackageListWhereForOwner,
  orderListWhereForOwnerAnd,
  storefrontSettingsListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { listChurnRiskCustomers } from "@/services/customers/churn-prediction-service";
import { isKlaviyoConfigured, listEmailCampaignFlows } from "@/services/marketing/email-marketing-service";

export type {
  AutoCampaignRecommendation,
  MarketingManagerDailyBrief,
  MarketingManagerSnapshot,
  WeatherPromoRecommendation,
} from "@/lib/ai/marketing-manager-types";

/**
 * AI Marketing Manager — auto campaign recommendations and weather-driven promos.
 * Deterministic engine using order volume, churn signals, cart recovery, and calendar/weather proxies.
 */
export async function loadMarketingManagerSnapshot(userId: string) {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) {
    throw new Error(`No workspace for user: ${userId}`);
  }

  const since7d = subDays(new Date(), AI_MARKETING_LOOKBACK_DAYS);
  const since30d = subDays(new Date(), 30);
  const [customerWhere, orderWhere7d, holidayScope, storefrontScope] = await Promise.all([
    kitchenCustomerListWhereForOwner(userId),
    orderListWhereForOwnerAnd(userId, {
      createdAt: { gte: since7d },
      status: { not: "CANCELLED" },
    }),
    holidayPackageListWhereForOwner(userId),
    storefrontSettingsListWhereForOwner(userId),
  ]);

  const [flows, churnRows, ordersLast7d, marketingConsentCount, newCustomers30d, holidayActive, storefront] =
    await Promise.all([
      listEmailCampaignFlows(),
      listChurnRiskCustomers(userId, 100),
      prisma.order.count({ where: orderWhere7d }),
      prisma.kitchenCustomer.count({
        where: { AND: [customerWhere, { marketingConsent: true, status: "ACTIVE" }] },
      }),
      prisma.kitchenCustomer.count({
        where: { AND: [customerWhere, { createdAt: { gte: since30d } }] },
      }),
      prisma.holidayPackage.count({
        where: { AND: [holidayScope, { active: true, availableUntil: { gte: new Date() } }] },
      }),
      prisma.storefrontSettings.findFirst({
        where: storefrontScope,
        select: { id: true },
      }),
    ]);

  let openCarts = 0;
  if (storefront) {
    openCarts = await prisma.storefrontCartRecovery.count({
      where: {
        storefrontId: storefront.id,
        convertedAt: null,
        marketingConsentAt: { not: null },
        unsubscribedAt: null,
      },
    });
  }

  const churnRiskCount = churnRows.filter((row) => row.churnScore >= AI_MARKETING_CHURN_WINBACK_THRESHOLD).length;

  return buildMarketingManagerSnapshot({
    workspaceId,
    klaviyoConfigured: isKlaviyoConfigured(),
    ordersLast7d,
    churnRiskCount,
    openCarts,
    activeHolidayPackages: holidayActive,
    marketingConsentCount,
    newCustomers30d,
    flows,
  });
}

export async function loadMarketingManagerSnapshotForWorkspace(workspaceId: string) {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }
  return loadMarketingManagerSnapshot(ownerUserId);
}
