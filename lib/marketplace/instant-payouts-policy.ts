import type { VendorPlanTier } from "@prisma/client";

import type { VendorConnectStatus } from "@/lib/marketplace/stripe-connect-config";

export const INSTANT_PAYOUT_MIN_USD = 10;
export const INSTANT_PAYOUT_MAX_PER_DAY = 3;
export const INSTANT_PAYOUT_MIN_ACCOUNT_AGE_DAYS = 30;
export const INSTANT_PAYOUT_MIN_LIFETIME_GMV_USD = 1000;
export const INSTANT_PAYOUT_MIN_FEE_USD = 0.5;

export type InstantPayoutEligibilityInput = {
  planTier: VendorPlanTier;
  connectStatus: VendorConnectStatus;
  availableBalance: number;
  openDisputeCount: number;
  instantPayoutsToday: number;
  accountAgeDays: number;
  lifetimeGmvUsd: number;
  featureFlagEnabled: boolean;
};

export type InstantPayoutEligibility = {
  eligible: boolean;
  reasons: string[];
  feePercent: number;
  estimatedMinutes: number;
};

export function instantPayoutFeePercent(planTier: VendorPlanTier): number | null {
  switch (planTier) {
    case "GROWTH":
      return 1.5;
    case "ENTERPRISE":
      return 1.0;
    default:
      return null;
  }
}

export function calculateInstantPayoutFee(amountUsd: number, feePercent: number): number {
  const raw = (amountUsd * feePercent) / 100;
  return Math.round(Math.max(INSTANT_PAYOUT_MIN_FEE_USD, raw) * 100) / 100;
}

export function evaluateInstantPayoutEligibility(
  input: InstantPayoutEligibilityInput,
): InstantPayoutEligibility {
  const reasons: string[] = [];
  const feePercent = instantPayoutFeePercent(input.planTier);

  if (!input.featureFlagEnabled) {
    reasons.push("Instant payouts are in pilot — enable MARKETPLACE_INSTANT_PAYOUTS on staging.");
  }
  if (feePercent == null) {
    reasons.push("Upgrade to Growth or Enterprise to unlock instant debit payouts.");
  }
  if (input.connectStatus === "disabled") {
    reasons.push("Stripe Connect is not enabled for marketplace vendors.");
  } else if (input.connectStatus === "not_connected") {
    reasons.push("Complete Stripe Connect onboarding first.");
  } else if (input.connectStatus === "pending_verification") {
    reasons.push("Stripe is still verifying your payout account.");
  }
  if (input.availableBalance < INSTANT_PAYOUT_MIN_USD) {
    reasons.push(`Minimum available balance is $${INSTANT_PAYOUT_MIN_USD}.`);
  }
  if (input.openDisputeCount > 0) {
    reasons.push("Resolve open marketplace disputes before requesting instant payout.");
  }
  if (input.instantPayoutsToday >= INSTANT_PAYOUT_MAX_PER_DAY) {
    reasons.push(`Daily limit reached (${INSTANT_PAYOUT_MAX_PER_DAY} instant payouts per day).`);
  }
  if (
    input.accountAgeDays < INSTANT_PAYOUT_MIN_ACCOUNT_AGE_DAYS &&
    input.lifetimeGmvUsd < INSTANT_PAYOUT_MIN_LIFETIME_GMV_USD
  ) {
    reasons.push(
      `Account must be ${INSTANT_PAYOUT_MIN_ACCOUNT_AGE_DAYS}+ days old or have $${INSTANT_PAYOUT_MIN_LIFETIME_GMV_USD}+ lifetime GMV.`,
    );
  }

  return {
    eligible: reasons.length === 0 && feePercent != null,
    reasons,
    feePercent: feePercent ?? 0,
    estimatedMinutes: 30,
  };
}
