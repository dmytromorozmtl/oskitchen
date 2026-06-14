import {
  computeStorefrontLoyaltyEarnPoints,
  quoteStorefrontLoyaltyRedeemCredit,
} from "@/lib/loyalty/loyalty-earn-redeem-p2-41-measurement";

export type LoyaltyProgramConfig = {
  pointsPerDollar: number;
  redeemPointsThreshold: number;
  redeemValueCents: number;
  active: boolean;
};

export type LoyaltyAccountSim = {
  balance: number;
};

export const DEFAULT_LOYALTY_PROGRAM_CONFIG: LoyaltyProgramConfig = {
  pointsPerDollar: 10,
  redeemPointsThreshold: 100,
  redeemValueCents: 100,
  active: true,
};

export function earnPosLoyaltyPoints(
  account: LoyaltyAccountSim,
  orderTotal: number,
  config: LoyaltyProgramConfig = DEFAULT_LOYALTY_PROGRAM_CONFIG,
): LoyaltyAccountSim {
  if (!config.active || orderTotal <= 0) return account;
  const earned = Math.floor(orderTotal * config.pointsPerDollar);
  return { balance: account.balance + earned };
}

export function redeemPosLoyaltyPoints(
  account: LoyaltyAccountSim,
  points: number,
  config: LoyaltyProgramConfig = DEFAULT_LOYALTY_PROGRAM_CONFIG,
): { account: LoyaltyAccountSim; discount: number } | { error: string } {
  if (points > account.balance) return { error: "Insufficient loyalty points" };
  const blocks = Math.floor(points / config.redeemPointsThreshold);
  const discount = (blocks * config.redeemValueCents) / 100;
  return {
    account: { balance: account.balance - points },
    discount,
  };
}

export function earnStorefrontLoyaltyPoints(
  account: LoyaltyAccountSim,
  subtotal: number,
): LoyaltyAccountSim {
  const earned = computeStorefrontLoyaltyEarnPoints(subtotal, {
    pointsPerDollar: DEFAULT_LOYALTY_PROGRAM_CONFIG.pointsPerDollar,
    isActive: true,
  });
  return { balance: account.balance + earned };
}

export function redeemStorefrontLoyaltyPoints(
  account: LoyaltyAccountSim,
  points: number,
): { account: LoyaltyAccountSim; creditAmount: number; pointsUsed: number } | { error: string } {
  const quote = quoteStorefrontLoyaltyRedeemCredit(points, {
    redeemPoints: DEFAULT_LOYALTY_PROGRAM_CONFIG.redeemPointsThreshold,
    redeemAmount: DEFAULT_LOYALTY_PROGRAM_CONFIG.redeemValueCents / 100,
    minPointsToRedeem: DEFAULT_LOYALTY_PROGRAM_CONFIG.redeemPointsThreshold,
  });
  if (!quote.ok) return { error: quote.error };
  if (quote.pointsUsed > account.balance) return { error: "Insufficient points." };
  return {
    account: { balance: account.balance - quote.pointsUsed },
    creditAmount: quote.creditAmount,
    pointsUsed: quote.pointsUsed,
  };
}
