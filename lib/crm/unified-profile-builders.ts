import {
  UNIFIED_PROFILE_PATH,
  UNIFIED_PROFILE_POLICY_ID,
} from "@/lib/crm/unified-profile-policy";
import type {
  UnifiedCustomerPreferences,
  UnifiedCustomerProfileSnapshot,
  UnifiedProfileHubRow,
  UnifiedProfileHubSnapshot,
  UnifiedProfileLoyaltySnapshot,
  UnifiedProfileOrderRow,
  UnifiedProfileTimelineRow,
} from "@/lib/crm/unified-profile-types";

export function buildUnifiedProfileOrderRow(input: {
  id: string;
  status: string;
  fulfillmentType: string;
  total: number | { toNumber?: () => number } | string;
  createdAt: Date;
}): UnifiedProfileOrderRow {
  const total =
    typeof input.total === "number"
      ? input.total
      : typeof input.total === "string"
        ? Number(input.total)
        : input.total.toNumber?.() ?? Number(input.total);

  return {
    id: input.id,
    status: input.status,
    fulfillmentType: input.fulfillmentType,
    total,
    createdAtIso: input.createdAt.toISOString(),
    href: `/dashboard/orders/${input.id}`,
  };
}

export function buildUnifiedProfileTimelineRow(input: {
  id: string;
  eventType: string;
  summary: string | null;
  createdAt: Date;
}): UnifiedProfileTimelineRow {
  return {
    id: input.id,
    eventType: input.eventType,
    summary: input.summary,
    createdAtIso: input.createdAt.toISOString(),
  };
}

export function buildUnifiedProfileLoyaltySnapshot(input: {
  pointsBalance: number;
  tier: string;
  transactions: Array<{
    id: string;
    type: string;
    points: number;
    createdAt: Date;
    notes: string | null;
  }>;
}): UnifiedProfileLoyaltySnapshot {
  return {
    pointsBalance: input.pointsBalance,
    tier: input.tier,
    recentTransactions: input.transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      points: tx.points,
      createdAtIso: tx.createdAt.toISOString(),
      notes: tx.notes,
    })),
  };
}

export function buildUnifiedCustomerProfileSnapshot(input: {
  customerId: string;
  identity: UnifiedCustomerProfileSnapshot["identity"];
  metrics: {
    totalOrders: number;
    lifetimeValueCents: number;
    averageOrderValueCents: number;
    lastOrderAt: Date | null;
    firstOrderAt: Date | null;
    atRiskScore: number | null;
  };
  preferences: UnifiedCustomerPreferences;
  orders: UnifiedProfileOrderRow[];
  history: UnifiedProfileTimelineRow[];
  loyalty: UnifiedProfileLoyaltySnapshot | null;
  segments: string[];
  mealPlanCount: number;
  analyzedAt?: Date;
}): UnifiedCustomerProfileSnapshot {
  return {
    policyId: UNIFIED_PROFILE_POLICY_ID,
    customerId: input.customerId,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    identity: input.identity,
    metrics: {
      totalOrders: input.metrics.totalOrders,
      lifetimeValueUsd: Math.round((input.metrics.lifetimeValueCents / 100) * 100) / 100,
      averageOrderValueUsd: Math.round((input.metrics.averageOrderValueCents / 100) * 100) / 100,
      lastOrderAtIso: input.metrics.lastOrderAt?.toISOString() ?? null,
      firstOrderAtIso: input.metrics.firstOrderAt?.toISOString() ?? null,
      atRiskScore: input.metrics.atRiskScore,
    },
    preferences: input.preferences,
    orders: input.orders,
    history: input.history,
    loyalty: input.loyalty,
    segments: input.segments,
    mealPlanCount: input.mealPlanCount,
    href: `${UNIFIED_PROFILE_PATH}/${input.customerId}`,
    basePath: UNIFIED_PROFILE_PATH,
  };
}

export function buildUnifiedProfileHubRow(input: {
  customerId: string;
  displayName: string;
  email: string;
  totalOrders: number;
  lifetimeValueCents: number;
  loyaltyPoints: number | null;
  lastOrderAt: Date | null;
}): UnifiedProfileHubRow {
  return {
    customerId: input.customerId,
    displayName: input.displayName,
    email: input.email,
    totalOrders: input.totalOrders,
    lifetimeValueUsd: Math.round((input.lifetimeValueCents / 100) * 100) / 100,
    loyaltyPoints: input.loyaltyPoints,
    lastOrderAtIso: input.lastOrderAt?.toISOString() ?? null,
    href: `${UNIFIED_PROFILE_PATH}/${input.customerId}`,
  };
}

export function buildUnifiedProfileHubSnapshot(input: {
  customers: UnifiedProfileHubRow[];
  analyzedAt?: Date;
}): UnifiedProfileHubSnapshot {
  return {
    policyId: UNIFIED_PROFILE_POLICY_ID,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    customers: input.customers,
    summary: {
      totalCustomers: input.customers.length,
      withLoyalty: input.customers.filter((row) => (row.loyaltyPoints ?? 0) > 0).length,
      withOrders: input.customers.filter((row) => row.totalOrders > 0).length,
    },
    basePath: UNIFIED_PROFILE_PATH,
  };
}
