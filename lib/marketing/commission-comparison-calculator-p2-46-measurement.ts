import {
  COMMISSION_COMPARISON_CALCULATOR_P2_46_DEFAULT_PROCESSING_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_DOORDASH_BENCHMARK_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_OWNED_MARKETPLACE_PCT,
} from "@/lib/marketing/commission-comparison-calculator-p2-46-policy";

export type DoorDashVsOwnedInputs = {
  monthlyOrders: number;
  averageOrderValue: number;
  doordashMixPct: number;
  ownChannelProcessingPct: number;
};

export const DOORDASH_VS_OWNED_DEFAULT_INPUTS: DoorDashVsOwnedInputs = {
  monthlyOrders: 400,
  averageOrderValue: 28,
  doordashMixPct: 100,
  ownChannelProcessingPct: COMMISSION_COMPARISON_CALCULATOR_P2_46_DEFAULT_PROCESSING_PCT,
};

export type DoorDashVsOwnedResult = {
  grossMonthly: number;
  doordashOrders: number;
  doordashCommissionMonthly: number;
  doordashCommissionRatePct: number;
  ownedMarketplaceCommissionMonthly: number;
  ownedMarketplaceRatePct: number;
  ownedProcessingFeesMonthly: number;
  monthlySavingsVsDoordash: number;
  annualSavingsVsDoordash: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** ChowNow-style compare: DoorDash ~30% marketplace vs owned 0% marketplace + processing only. */
export function computeDoorDashVsOwnedCommission(
  raw: DoorDashVsOwnedInputs,
): DoorDashVsOwnedResult {
  const monthlyOrders = clampNonNegative(raw.monthlyOrders);
  const averageOrderValue = clampNonNegative(raw.averageOrderValue);
  const doordashMixPct = Math.min(100, clampNonNegative(raw.doordashMixPct));
  const ownChannelProcessingPct = clampNonNegative(raw.ownChannelProcessingPct);

  const doordashOrders = round2((monthlyOrders * doordashMixPct) / 100);
  const grossMonthly = round2(doordashOrders * averageOrderValue);

  const doordashCommissionRatePct = COMMISSION_COMPARISON_CALCULATOR_P2_46_DOORDASH_BENCHMARK_PCT;
  const doordashCommissionMonthly = round2(
    (grossMonthly * doordashCommissionRatePct) / 100,
  );

  const ownedMarketplaceRatePct = COMMISSION_COMPARISON_CALCULATOR_P2_46_OWNED_MARKETPLACE_PCT;
  const ownedMarketplaceCommissionMonthly = round2(
    (grossMonthly * ownedMarketplaceRatePct) / 100,
  );
  const ownedProcessingFeesMonthly = round2(
    (grossMonthly * ownChannelProcessingPct) / 100,
  );

  const monthlySavingsVsDoordash = round2(
    doordashCommissionMonthly - ownedMarketplaceCommissionMonthly - ownedProcessingFeesMonthly,
  );
  const annualSavingsVsDoordash = round2(monthlySavingsVsDoordash * 12);

  return {
    grossMonthly,
    doordashOrders,
    doordashCommissionMonthly,
    doordashCommissionRatePct,
    ownedMarketplaceCommissionMonthly,
    ownedMarketplaceRatePct,
    ownedProcessingFeesMonthly,
    monthlySavingsVsDoordash,
    annualSavingsVsDoordash,
  };
}

export function formatCommissionUsdShort(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
