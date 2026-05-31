import type { ChannelFeeType } from "@prisma/client";

export type ChannelFeeRuleLike = {
  feeType: ChannelFeeType;
  percentage: number;
  fixedAmount: number;
};

/**
 * Operational estimate of marketplace / platform take — user-configured only.
 * OS Kitchen does not ship partner-specific fee tables.
 */
export function estimatePlatformFee(salePrice: number, rule: ChannelFeeRuleLike | null): number {
  if (!rule || salePrice <= 0) return 0;
  const pct = Number(rule.percentage) / 100;
  const fixed = Number(rule.fixedAmount);
  switch (rule.feeType) {
    case "PERCENTAGE":
      return Math.max(0, salePrice * pct);
    case "FIXED":
      return Math.max(0, fixed);
    case "MIXED":
      return Math.max(0, salePrice * pct + fixed);
    default:
      return Math.max(0, salePrice * pct + fixed);
  }
}

export function estimatePaymentProcessingFee(salePrice: number, processingPercent: number): number {
  if (salePrice <= 0 || processingPercent <= 0) return 0;
  return Math.max(0, salePrice * processingPercent);
}
