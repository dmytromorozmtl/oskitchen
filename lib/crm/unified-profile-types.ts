import type { UNIFIED_PROFILE_POLICY_ID } from "@/lib/crm/unified-profile-policy";

export type UnifiedProfileOrderRow = {
  id: string;
  status: string;
  fulfillmentType: string;
  total: number;
  createdAtIso: string;
  href: string;
};

export type UnifiedProfileTimelineRow = {
  id: string;
  eventType: string;
  summary: string | null;
  createdAtIso: string;
};

export type UnifiedProfileLoyaltySnapshot = {
  pointsBalance: number;
  tier: string;
  recentTransactions: Array<{
    id: string;
    type: string;
    points: number;
    createdAtIso: string;
    notes: string | null;
  }>;
};

export type UnifiedCustomerPreferences = {
  allergies: string[];
  dietary: string[];
  dislikes: string[];
  favorites: string[];
  tags: string[];
  preferredFulfillment: string | null;
  marketingConsent: boolean;
  smsConsent: boolean;
};

export type UnifiedCustomerProfileSnapshot = {
  policyId: typeof UNIFIED_PROFILE_POLICY_ID;
  customerId: string;
  generatedAtIso: string;
  identity: {
    displayName: string;
    email: string;
    phone: string | null;
    type: string;
    status: string;
    source: string;
    companyName: string | null;
  };
  metrics: {
    totalOrders: number;
    lifetimeValueUsd: number;
    averageOrderValueUsd: number;
    lastOrderAtIso: string | null;
    firstOrderAtIso: string | null;
    atRiskScore: number | null;
  };
  preferences: UnifiedCustomerPreferences;
  orders: UnifiedProfileOrderRow[];
  history: UnifiedProfileTimelineRow[];
  loyalty: UnifiedProfileLoyaltySnapshot | null;
  segments: string[];
  mealPlanCount: number;
  href: string;
  basePath: string;
};

export type UnifiedProfileHubRow = {
  customerId: string;
  displayName: string;
  email: string;
  totalOrders: number;
  lifetimeValueUsd: number;
  loyaltyPoints: number | null;
  lastOrderAtIso: string | null;
  href: string;
};

export type UnifiedProfileHubSnapshot = {
  policyId: typeof UNIFIED_PROFILE_POLICY_ID;
  generatedAtIso: string;
  customers: UnifiedProfileHubRow[];
  summary: {
    totalCustomers: number;
    withLoyalty: number;
    withOrders: number;
  };
  basePath: string;
};
