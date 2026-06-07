import {
  DELIVERY_COMMISSION_BENCHMARK_RATE_PCT,
  DELIVERY_COMMISSION_PROVIDER_LABEL,
  DELIVERY_COMMISSION_PROVIDERS,
  type DeliveryCommissionProvider,
} from "@/lib/delivery/delivery-commission-tracking-absolute-final-policy";

export const COMMISSION_COMPARISON_CALCULATOR_PATH = "/commission-comparison" as const;

export const COMMISSION_COMPARISON_CALCULATOR_META = {
  title: "Delivery Commission Comparison Calculator | OS Kitchen",
  description:
    "Compare marketplace delivery commission (DoorDash, Uber Eats, Grubhub) vs owned storefront payment processing — directional benchmarks, not settlement guarantees.",
} as const;

export const COMMISSION_COMPARISON_DEFAULT_OWN_CHANNEL_PROCESSING_PCT = 2.9 as const;

export const COMMISSION_COMPARISON_DISCLAIMER =
  "Directional benchmark calculator — reconcile against marketplace settlement statements. Own-channel fees model payment processing only, not OS Kitchen subscription." as const;

export type CommissionComparisonInputs = {
  monthlyOrders: number;
  averageOrderValue: number;
  doordashMixPct: number;
  uberEatsMixPct: number;
  grubhubMixPct: number;
  uberDirectMixPct: number;
  ownChannelProcessingPct: number;
};

export const COMMISSION_COMPARISON_DEFAULT_INPUTS: CommissionComparisonInputs = {
  monthlyOrders: 400,
  averageOrderValue: 28,
  doordashMixPct: 40,
  uberEatsMixPct: 35,
  grubhubMixPct: 15,
  uberDirectMixPct: 10,
  ownChannelProcessingPct: COMMISSION_COMPARISON_DEFAULT_OWN_CHANNEL_PROCESSING_PCT,
};

export type CommissionComparisonChannelRow = {
  provider: DeliveryCommissionProvider;
  label: string;
  orders: number;
  grossMonthly: number;
  commissionRatePct: number;
  commissionMonthly: number;
  netPayoutMonthly: number;
};

export type CommissionComparisonResult = {
  channels: CommissionComparisonChannelRow[];
  marketplaceGrossMonthly: number;
  marketplaceCommissionMonthly: number;
  marketplaceEffectiveRatePct: number | null;
  ownChannelGrossMonthly: number;
  ownChannelFeesMonthly: number;
  monthlySavingsVsMarketplace: number;
  annualSavingsVsMarketplace: number;
  mixTotalPct: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function computeCommissionComparison(
  raw: CommissionComparisonInputs,
): CommissionComparisonResult {
  const monthlyOrders = clampNonNegative(raw.monthlyOrders);
  const averageOrderValue = clampNonNegative(raw.averageOrderValue);
  const ownChannelProcessingPct = clampNonNegative(raw.ownChannelProcessingPct);

  const mixByProvider: Record<DeliveryCommissionProvider, number> = {
    DOORDASH: clampNonNegative(raw.doordashMixPct),
    UBER_EATS: clampNonNegative(raw.uberEatsMixPct),
    GRUBHUB: clampNonNegative(raw.grubhubMixPct),
    UBER_DIRECT: clampNonNegative(raw.uberDirectMixPct),
  };

  const mixTotalPct = round2(
    mixByProvider.DOORDASH +
      mixByProvider.UBER_EATS +
      mixByProvider.GRUBHUB +
      mixByProvider.UBER_DIRECT,
  );

  const mixScale = mixTotalPct > 0 ? 100 / mixTotalPct : 0;

  const channels: CommissionComparisonChannelRow[] = DELIVERY_COMMISSION_PROVIDERS.map(
    (provider) => {
      const normalizedMix = round2(mixByProvider[provider] * mixScale);
      const orders = round2((monthlyOrders * normalizedMix) / 100);
      const grossMonthly = round2(orders * averageOrderValue);
      const commissionRatePct = DELIVERY_COMMISSION_BENCHMARK_RATE_PCT[provider];
      const commissionMonthly = round2((grossMonthly * commissionRatePct) / 100);
      return {
        provider,
        label: DELIVERY_COMMISSION_PROVIDER_LABEL[provider],
        orders,
        grossMonthly,
        commissionRatePct,
        commissionMonthly,
        netPayoutMonthly: round2(grossMonthly - commissionMonthly),
      };
    },
  );

  const marketplaceGrossMonthly = round2(
    channels.reduce((sum, row) => sum + row.grossMonthly, 0),
  );
  const marketplaceCommissionMonthly = round2(
    channels.reduce((sum, row) => sum + row.commissionMonthly, 0),
  );
  const marketplaceEffectiveRatePct =
    marketplaceGrossMonthly > 0
      ? round2((marketplaceCommissionMonthly / marketplaceGrossMonthly) * 100)
      : null;

  const ownChannelGrossMonthly = marketplaceGrossMonthly;
  const ownChannelFeesMonthly = round2(
    (ownChannelGrossMonthly * ownChannelProcessingPct) / 100,
  );
  const monthlySavingsVsMarketplace = round2(
    marketplaceCommissionMonthly - ownChannelFeesMonthly,
  );
  const annualSavingsVsMarketplace = round2(monthlySavingsVsMarketplace * 12);

  return {
    channels,
    marketplaceGrossMonthly,
    marketplaceCommissionMonthly,
    marketplaceEffectiveRatePct,
    ownChannelGrossMonthly,
    ownChannelFeesMonthly,
    monthlySavingsVsMarketplace,
    annualSavingsVsMarketplace,
    mixTotalPct: mixTotalPct > 0 ? 100 : 0,
  };
}

export function formatCommissionUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
