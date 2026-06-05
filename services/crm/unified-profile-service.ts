import {
  buildUnifiedCustomerProfileSnapshot,
  buildUnifiedProfileHubRow,
  buildUnifiedProfileHubSnapshot,
  buildUnifiedProfileLoyaltySnapshot,
  buildUnifiedProfileOrderRow,
  buildUnifiedProfileTimelineRow,
} from "@/lib/crm/unified-profile-builders";
import {
  UNIFIED_PROFILE_LOYALTY_TX_LIMIT,
  UNIFIED_PROFILE_ORDER_LIMIT,
  UNIFIED_PROFILE_TIMELINE_LIMIT,
} from "@/lib/crm/unified-profile-policy";
import type {
  UnifiedCustomerProfileSnapshot,
  UnifiedProfileHubSnapshot,
} from "@/lib/crm/unified-profile-types";
import {
  parseAllergies,
  parseDietaryPreferences,
  parseDislikes,
  parseFavoriteItems,
  parseTags,
} from "@/lib/crm/customer-privacy";
import { CUSTOMER_SOURCE_LABEL, CUSTOMER_TYPE_LABEL } from "@/lib/crm/customer-types";
import { CUSTOMER_STATUS_LABEL } from "@/lib/crm/customer-status";
import { prisma } from "@/lib/prisma";
import {
  getCustomerForUser,
  listOrdersForCustomer,
} from "@/services/crm/customer-service";

export type {
  UnifiedCustomerProfileSnapshot,
  UnifiedProfileHubSnapshot,
} from "@/lib/crm/unified-profile-types";

export async function loadUnifiedCustomerProfileSnapshot(
  userId: string,
  customerId: string,
): Promise<UnifiedCustomerProfileSnapshot | null> {
  const customer = await getCustomerForUser({ userId }, customerId);
  if (!customer) return null;

  const [orders, mealPlanCount, loyaltyAccount] = await Promise.all([
    listOrdersForCustomer({ userId }, customer.email, UNIFIED_PROFILE_ORDER_LIMIT),
    prisma.mealPlan.count({ where: { userId, customerId: customer.id } }),
    prisma.loyaltyAccount.findUnique({
      where: { customerId: customer.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: UNIFIED_PROFILE_LOYALTY_TX_LIMIT,
        },
      },
    }),
  ]);

  const loyalty = loyaltyAccount
    ? buildUnifiedProfileLoyaltySnapshot({
        pointsBalance: loyaltyAccount.pointsBalance,
        tier: loyaltyAccount.tier,
        transactions: loyaltyAccount.transactions,
      })
    : null;

  return buildUnifiedCustomerProfileSnapshot({
    customerId: customer.id,
    identity: {
      displayName: customer.displayName ?? customer.name ?? customer.email,
      email: customer.email,
      phone: customer.phone,
      type: CUSTOMER_TYPE_LABEL[customer.type],
      status: CUSTOMER_STATUS_LABEL[customer.status],
      source: CUSTOMER_SOURCE_LABEL[customer.source],
      companyName: customer.companyName,
    },
    metrics: {
      totalOrders: customer.totalOrders,
      lifetimeValueCents: customer.lifetimeValueCents,
      averageOrderValueCents: customer.averageOrderValueCents,
      lastOrderAt: customer.lastOrderAt,
      firstOrderAt: customer.firstOrderAt,
      atRiskScore: customer.atRiskScore,
    },
    preferences: {
      allergies: parseAllergies(customer.allergiesJson),
      dietary: parseDietaryPreferences(customer.dietaryPreferencesJson),
      dislikes: parseDislikes(customer.dislikesJson),
      favorites: parseFavoriteItems(customer.favoriteItemsJson),
      tags: parseTags(customer.tagsJson),
      preferredFulfillment: customer.preferredFulfillmentType,
      marketingConsent: customer.marketingConsent,
      smsConsent: customer.smsConsent,
    },
    orders: orders.map((order) => buildUnifiedProfileOrderRow(order)),
    history: customer.timelineEvents
      .slice(0, UNIFIED_PROFILE_TIMELINE_LIMIT)
      .map((event) => buildUnifiedProfileTimelineRow(event)),
    loyalty,
    segments: customer.segmentMemberships.map((row) => row.segment.name),
    mealPlanCount,
  });
}

export async function loadUnifiedProfileHubSnapshot(
  userId: string,
): Promise<UnifiedProfileHubSnapshot> {
  const customers = await prisma.kitchenCustomer.findMany({
    where: { userId },
    orderBy: [{ lifetimeValueCents: "desc" }, { lastOrderAt: "desc" }],
    take: 30,
    select: {
      id: true,
      email: true,
      displayName: true,
      name: true,
      totalOrders: true,
      lifetimeValueCents: true,
      lastOrderAt: true,
      loyaltyAccount: { select: { pointsBalance: true } },
    },
  });

  return buildUnifiedProfileHubSnapshot({
    customers: customers.map((row) =>
      buildUnifiedProfileHubRow({
        customerId: row.id,
        displayName: row.displayName ?? row.name ?? row.email,
        email: row.email,
        totalOrders: row.totalOrders,
        lifetimeValueCents: row.lifetimeValueCents,
        loyaltyPoints: row.loyaltyAccount?.pointsBalance ?? null,
        lastOrderAt: row.lastOrderAt,
      }),
    ),
  });
}
