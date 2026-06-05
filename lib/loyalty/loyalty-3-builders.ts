import { LOYALTY_3_PATH, LOYALTY_3_POLICY_ID } from "@/lib/loyalty/loyalty-3-policy";
import type {
  Loyalty3CrossBrandLane,
  Loyalty3DashboardSnapshot,
  Loyalty3EventOpportunity,
  Loyalty3ReferralStats,
  Loyalty3VipMember,
} from "@/lib/loyalty/loyalty-3-types";
import type { Loyalty3Program } from "@/lib/loyalty/loyalty-3-types";

export function buildLoyalty3CrossBrandLane(input: {
  brandId: string | null;
  brandName: string;
  memberCount: number;
  pointsEarned: number;
}): Loyalty3CrossBrandLane {
  return {
    brandId: input.brandId,
    brandName: input.brandName,
    memberCount: input.memberCount,
    pointsEarned: input.pointsEarned,
  };
}

export function buildLoyalty3VipMember(input: {
  customerId: string;
  displayName: string;
  pointsBalance: number;
  tier: string;
  lifetimeValueCents: number;
}): Loyalty3VipMember {
  return {
    customerId: input.customerId,
    displayName: input.displayName,
    pointsBalance: input.pointsBalance,
    tier: input.tier,
    lifetimeValueUsd: Math.round((input.lifetimeValueCents / 100) * 100) / 100,
    href: `/dashboard/customers/unified-profile/${input.customerId}`,
  };
}

export function buildLoyalty3EventOpportunity(input: {
  id: string;
  title: string;
  eventDate: Date | null;
  guestCount: number | null;
  status: string;
  customerName: string | null;
}): Loyalty3EventOpportunity {
  return {
    id: input.id,
    title: input.title,
    eventDateIso: input.eventDate?.toISOString() ?? null,
    guestCount: input.guestCount,
    status: input.status,
    customerName: input.customerName,
    href: `/dashboard/catering-quotes/${input.id}`,
  };
}

export function buildLoyalty3ReferralStats(input: {
  completedReferrals: number;
  pendingReferrals: number;
  bonusPointsAwarded: number;
  recentReferrals: Loyalty3ReferralStats["recentReferrals"];
}): Loyalty3ReferralStats {
  return {
    completedReferrals: input.completedReferrals,
    pendingReferrals: input.pendingReferrals,
    bonusPointsAwarded: input.bonusPointsAwarded,
    recentReferrals: input.recentReferrals,
  };
}

export function buildLoyalty3DashboardSnapshot(input: {
  program: Loyalty3Program;
  crossBrandLanes: Loyalty3CrossBrandLane[];
  vipMembers: Loyalty3VipMember[];
  eventOpportunities: Loyalty3EventOpportunity[];
  referralStats: Loyalty3ReferralStats;
  totalMembers: number;
  analyzedAt?: Date;
}): Loyalty3DashboardSnapshot {
  const crossBrandPoints = input.crossBrandLanes.reduce((sum, lane) => sum + lane.pointsEarned, 0);

  return {
    policyId: LOYALTY_3_POLICY_ID,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    program: input.program,
    crossBrandLanes: input.crossBrandLanes,
    vipMembers: input.vipMembers,
    eventOpportunities: input.eventOpportunities,
    referralStats: input.referralStats,
    summary: {
      totalMembers: input.totalMembers,
      crossBrandPoints,
      vipCount: input.vipMembers.length,
      eventBonusEligible: input.eventOpportunities.length,
    },
    basePath: LOYALTY_3_PATH,
  };
}
