import {
  COMMISSION_COMPARISON_CALCULATOR_P2_54_DEFAULT_PROCESSING_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_DOORDASH_BENCHMARK_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_OWNED_MARKETPLACE_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_UBER_EATS_BENCHMARK_PCT,
} from "@/lib/marketing/commission-comparison-calculator-p2-54-policy";

export type DoorDashUberVsOwnedInputs = {
  monthlyOrders: number;
  averageOrderValue: number;
  doordashMixPct: number;
  uberEatsMixPct: number;
  ownChannelProcessingPct: number;
};

export const DOORDASH_UBER_VS_OWNED_DEFAULT_INPUTS: DoorDashUberVsOwnedInputs = {
  monthlyOrders: 400,
  averageOrderValue: 28,
  doordashMixPct: 55,
  uberEatsMixPct: 45,
  ownChannelProcessingPct: COMMISSION_COMPARISON_CALCULATOR_P2_54_DEFAULT_PROCESSING_PCT,
};

export type MarketplaceChannelSavings = {
  provider: "DOORDASH" | "UBER_EATS";
  label: string;
  commissionRatePct: number;
  orders: number;
  grossMonthly: number;
  commissionMonthly: number;
  monthlySavingsVsOwned: number;
  annualSavingsVsOwned: number;
};

export type DoorDashUberVsOwnedResult = {
  doordash: MarketplaceChannelSavings;
  uberEats: MarketplaceChannelSavings;
  mixTotalPct: number;
  combinedGrossMonthly: number;
  combinedMarketplaceCommissionMonthly: number;
  ownedFeesMonthly: number;
  combinedMonthlySavingsVsOwned: number;
  combinedAnnualSavingsVsOwned: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function computeChannelSavings(
  provider: "DOORDASH" | "UBER_EATS",
  label: string,
  commissionRatePct: number,
  orders: number,
  averageOrderValue: number,
  ownChannelProcessingPct: number,
): MarketplaceChannelSavings {
  const grossMonthly = round2(orders * averageOrderValue);
  const commissionMonthly = round2((grossMonthly * commissionRatePct) / 100);
  const ownedMarketplaceCommission = round2(
    (grossMonthly * COMMISSION_COMPARISON_CALCULATOR_P2_54_OWNED_MARKETPLACE_PCT) / 100,
  );
  const ownedProcessingFees = round2((grossMonthly * ownChannelProcessingPct) / 100);
  const monthlySavingsVsOwned = round2(
    commissionMonthly - ownedMarketplaceCommission - ownedProcessingFees,
  );

  return {
    provider,
    label,
    commissionRatePct,
    orders,
    grossMonthly,
    commissionMonthly,
    monthlySavingsVsOwned,
    annualSavingsVsOwned: round2(monthlySavingsVsOwned * 12),
  };
}

/** Interactive compare: DoorDash + Uber Eats marketplace commission vs owned channel. */
export function computeDoorDashUberVsOwnedCommission(
  raw: DoorDashUberVsOwnedInputs,
): DoorDashUberVsOwnedResult {
  const monthlyOrders = clampNonNegative(raw.monthlyOrders);
  const averageOrderValue = clampNonNegative(raw.averageOrderValue);
  const ownChannelProcessingPct = clampNonNegative(raw.ownChannelProcessingPct);

  const mixTotalPct = round2(
    clampNonNegative(raw.doordashMixPct) + clampNonNegative(raw.uberEatsMixPct),
  );
  const mixScale = mixTotalPct > 0 ? 100 / mixTotalPct : 0;

  const doordashOrders = round2(
    (monthlyOrders * clampNonNegative(raw.doordashMixPct) * mixScale) / 100,
  );
  const uberEatsOrders = round2(
    (monthlyOrders * clampNonNegative(raw.uberEatsMixPct) * mixScale) / 100,
  );

  const doordash = computeChannelSavings(
    "DOORDASH",
    "DoorDash",
    COMMISSION_COMPARISON_CALCULATOR_P2_54_DOORDASH_BENCHMARK_PCT,
    doordashOrders,
    averageOrderValue,
    ownChannelProcessingPct,
  );
  const uberEats = computeChannelSavings(
    "UBER_EATS",
    "Uber Eats",
    COMMISSION_COMPARISON_CALCULATOR_P2_54_UBER_EATS_BENCHMARK_PCT,
    uberEatsOrders,
    averageOrderValue,
    ownChannelProcessingPct,
  );

  const combinedGrossMonthly = round2(doordash.grossMonthly + uberEats.grossMonthly);
  const combinedMarketplaceCommissionMonthly = round2(
    doordash.commissionMonthly + uberEats.commissionMonthly,
  );
  const ownedFeesMonthly = round2(
    (combinedGrossMonthly * COMMISSION_COMPARISON_CALCULATOR_P2_54_OWNED_MARKETPLACE_PCT) / 100 +
      (combinedGrossMonthly * ownChannelProcessingPct) / 100,
  );
  const combinedMonthlySavingsVsOwned = round2(
    combinedMarketplaceCommissionMonthly - ownedFeesMonthly,
  );

  return {
    doordash,
    uberEats,
    mixTotalPct,
    combinedGrossMonthly,
    combinedMarketplaceCommissionMonthly,
    ownedFeesMonthly,
    combinedMonthlySavingsVsOwned,
    combinedAnnualSavingsVsOwned: round2(combinedMonthlySavingsVsOwned * 12),
  };
}

export function formatCommissionComparisonUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
