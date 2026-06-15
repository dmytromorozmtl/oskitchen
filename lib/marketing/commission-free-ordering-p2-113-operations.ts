/**
 * Pure helpers for commission-free ordering messaging (Blueprint P2-113).
 */

import { COMMISSION_FREE_ORDERING_P2_113_POLICY_ID } from "@/lib/marketing/commission-free-ordering-p2-113-policy";

export type CommissionFreeMessageBlock = {
  id: "storefront" | "stripe" | "compare";
  headline: string;
  body: string;
  guestCopy?: string;
};

export type CommissionFreeOrderingReport = {
  policyId: typeof COMMISSION_FREE_ORDERING_P2_113_POLICY_ID;
  osKitchenOrderCommissionPct: number;
  stripeProcessingPct: number;
  stripeFixedFeeUsd: number;
  marketplaceCommissionPct: number;
  monthlyOrderVolumeUsd: number;
  marketplaceFeesUsd: number;
  ownedChannelFeesUsd: number;
  monthlyDeltaUsd: number;
  stripeReady: boolean;
  stripeMode: "test" | "live" | "unknown";
  messages: CommissionFreeMessageBlock[];
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatStripeFeeDisclosure(input: {
  processingPct: number;
  fixedFeeUsd: number;
}): string {
  return `Stripe card processing: typical ~${input.processingPct}% + $${input.fixedFeeUsd.toFixed(2)} per successful charge — verify current Stripe pricing for your account.`;
}

export function buildStorefrontMessage(): CommissionFreeMessageBlock {
  return {
    id: "storefront",
    headline: "0% OS Kitchen commission on direct storefront orders",
    body: "Guests order on your branded storefront — OS Kitchen does not take a per-order marketplace commission on first-party checkout.",
    guestCopy:
      "Order direct — no marketplace middleman. Card payments processed securely via Stripe.",
  };
}

export function buildStripeMessage(input: {
  processingPct: number;
  fixedFeeUsd: number;
  stripeReady: boolean;
  stripeMode: "test" | "live" | "unknown";
}): CommissionFreeMessageBlock {
  const readiness =
    input.stripeReady && input.stripeMode === "live"
      ? "Stripe live mode configured."
      : input.stripeReady && input.stripeMode === "test"
        ? "Stripe test mode — use test cards only."
        : "Stripe not configured — enable STRIPE_SECRET_KEY before guest checkout.";

  return {
    id: "stripe",
    headline: "Payment processing only — no platform order take",
    body: `${formatStripeFeeDisclosure(input)} ${readiness}`,
    guestCopy: "Secure checkout powered by Stripe.",
  };
}

export function buildCompareMessage(input: {
  marketplaceCommissionPct: number;
  stripeProcessingPct: number;
}): CommissionFreeMessageBlock {
  return {
    id: "compare",
    headline: `Marketplace ~${input.marketplaceCommissionPct}% vs owned channel ~${input.stripeProcessingPct}% processing`,
    body: `Directional comparison — typical marketplace commission (~${input.marketplaceCommissionPct}%) vs Stripe processing-only (~${input.stripeProcessingPct}%). Not certified savings; verify your delivery contracts.`,
  };
}

export function computeOwnedChannelFeesUsd(input: {
  monthlyOrderVolumeUsd: number;
  stripeProcessingPct: number;
  stripeFixedFeeUsd: number;
  orderCount: number;
}): number {
  const pctFee = input.monthlyOrderVolumeUsd * (input.stripeProcessingPct / 100);
  const fixedFees = input.orderCount * input.stripeFixedFeeUsd;
  return roundMoney(pctFee + fixedFees);
}

export function computeMarketplaceFeesUsd(input: {
  monthlyOrderVolumeUsd: number;
  marketplaceCommissionPct: number;
}): number {
  return roundMoney(input.monthlyOrderVolumeUsd * (input.marketplaceCommissionPct / 100));
}

export function buildCommissionFreeOrderingReport(input: {
  osKitchenOrderCommissionPct?: number;
  stripeProcessingPct?: number;
  stripeFixedFeeUsd?: number;
  marketplaceCommissionPct?: number;
  monthlyOrderVolumeUsd?: number;
  orderCount?: number;
  stripeReady?: boolean;
  stripeMode?: "test" | "live" | "unknown";
}): CommissionFreeOrderingReport {
  const osKitchenOrderCommissionPct = input.osKitchenOrderCommissionPct ?? 0;
  const stripeProcessingPct = input.stripeProcessingPct ?? 2.9;
  const stripeFixedFeeUsd = input.stripeFixedFeeUsd ?? 0.3;
  const marketplaceCommissionPct = input.marketplaceCommissionPct ?? 25;
  const monthlyOrderVolumeUsd = input.monthlyOrderVolumeUsd ?? 12000;
  const orderCount = input.orderCount ?? 400;
  const stripeReady = input.stripeReady ?? false;
  const stripeMode = input.stripeMode ?? "unknown";

  const marketplaceFeesUsd = computeMarketplaceFeesUsd({
    monthlyOrderVolumeUsd,
    marketplaceCommissionPct,
  });
  const ownedChannelFeesUsd = computeOwnedChannelFeesUsd({
    monthlyOrderVolumeUsd,
    stripeProcessingPct,
    stripeFixedFeeUsd,
    orderCount,
  });

  const messages = [
    buildStorefrontMessage(),
    buildStripeMessage({ processingPct: stripeProcessingPct, fixedFeeUsd: stripeFixedFeeUsd, stripeReady, stripeMode }),
    buildCompareMessage({ marketplaceCommissionPct, stripeProcessingPct }),
  ];

  return {
    policyId: COMMISSION_FREE_ORDERING_P2_113_POLICY_ID,
    osKitchenOrderCommissionPct,
    stripeProcessingPct,
    stripeFixedFeeUsd,
    marketplaceCommissionPct,
    monthlyOrderVolumeUsd,
    marketplaceFeesUsd,
    ownedChannelFeesUsd,
    monthlyDeltaUsd: roundMoney(marketplaceFeesUsd - ownedChannelFeesUsd),
    stripeReady,
    stripeMode,
    messages,
  };
}

export const COMMISSION_FREE_ORDERING_DEMO_INPUT = {
  monthlyOrderVolumeUsd: 12000,
  orderCount: 400,
  marketplaceCommissionPct: 25,
  stripeProcessingPct: 2.9,
  stripeFixedFeeUsd: 0.3,
} as const;

export function buildCommissionFreeOrderingDemoReport(): CommissionFreeOrderingReport {
  return buildCommissionFreeOrderingReport({
    ...COMMISSION_FREE_ORDERING_DEMO_INPUT,
    osKitchenOrderCommissionPct: 0,
    stripeReady: true,
    stripeMode: "test",
  });
}

export function matchesCommissionFreeHeadline(text: string): boolean {
  return text.includes("0%") && text.toLowerCase().includes("commission");
}
