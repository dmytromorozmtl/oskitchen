import {
  LOYALTY_EARN_REDEEM_P2_41_POLICY_ID,
} from "@/lib/loyalty/loyalty-earn-redeem-p2-41-policy";

export type StorefrontLoyaltyProgramLike = {
  pointsPerDollar: number;
  redeemPoints: number;
  redeemAmount: number;
  minPointsToRedeem: number;
  isActive: boolean;
};

export function computeStorefrontLoyaltyEarnPoints(
  subtotal: number,
  program: Pick<StorefrontLoyaltyProgramLike, "pointsPerDollar" | "isActive">,
): number {
  if (!program.isActive) return 0;
  const ppd = Number(program.pointsPerDollar);
  if (ppd <= 0) return 0;
  return Math.floor(Math.max(0, subtotal) * ppd);
}

export function quoteStorefrontLoyaltyRedeemCredit(
  points: number,
  program: Pick<StorefrontLoyaltyProgramLike, "redeemPoints" | "redeemAmount" | "minPointsToRedeem">,
): { ok: true; creditAmount: number; pointsUsed: number } | { ok: false; error: string } {
  if (points < program.minPointsToRedeem) {
    return { ok: false, error: `Minimum ${program.minPointsToRedeem} points required.` };
  }
  const blocks = Math.floor(points / program.redeemPoints);
  if (blocks <= 0) {
    return { ok: false, error: `Redeem in blocks of ${program.redeemPoints} points.` };
  }
  const pointsUsed = blocks * program.redeemPoints;
  const creditAmount = blocks * Number(program.redeemAmount);
  return { ok: true, creditAmount, pointsUsed };
}

export function buildStorefrontLoyaltyEarnMetadata(input: {
  subtotal: number;
  pointsEarned: number;
  policyId: string;
}): Record<string, unknown> {
  return {
    subtotal: input.subtotal,
    pointsEarned: input.pointsEarned,
    policyId: input.policyId,
  };
}

export { LOYALTY_EARN_REDEEM_P2_41_POLICY_ID };
