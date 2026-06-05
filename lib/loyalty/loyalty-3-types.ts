import type { LOYALTY_3_POLICY_ID } from "@/lib/loyalty/loyalty-3-policy";
import type { Loyalty2Program } from "@/services/loyalty/loyalty-2.0-service";

export type Loyalty3Config = {
  crossBrandEnabled: boolean;
  vipMultiplier: number;
  vipMinLifetimeValueCents: number;
  eventBonusEnabled: boolean;
  eventBonusPoints: number;
  referralLeaderboardEnabled: boolean;
};

export type Loyalty3Program = Loyalty2Program & {
  v3: Loyalty3Config;
};

export type Loyalty3CrossBrandLane = {
  brandId: string | null;
  brandName: string;
  memberCount: number;
  pointsEarned: number;
};

export type Loyalty3VipMember = {
  customerId: string;
  displayName: string;
  pointsBalance: number;
  tier: string;
  lifetimeValueUsd: number;
  href: string;
};

export type Loyalty3EventOpportunity = {
  id: string;
  title: string;
  eventDateIso: string | null;
  guestCount: number | null;
  status: string;
  customerName: string | null;
  href: string;
};

export type Loyalty3ReferralStats = {
  completedReferrals: number;
  pendingReferrals: number;
  bonusPointsAwarded: number;
  recentReferrals: Array<{
    id: string;
    referrerLabel: string;
    friendLabel: string;
    points: number;
    createdAtIso: string;
  }>;
};

export type Loyalty3DashboardSnapshot = {
  policyId: typeof LOYALTY_3_POLICY_ID;
  generatedAtIso: string;
  program: Loyalty3Program;
  crossBrandLanes: Loyalty3CrossBrandLane[];
  vipMembers: Loyalty3VipMember[];
  eventOpportunities: Loyalty3EventOpportunity[];
  referralStats: Loyalty3ReferralStats;
  summary: {
    totalMembers: number;
    crossBrandPoints: number;
    vipCount: number;
    eventBonusEligible: number;
  };
  basePath: string;
};
