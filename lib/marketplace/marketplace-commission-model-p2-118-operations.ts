/**
 * Pure helpers for marketplace commission model (Blueprint P2-118).
 */

import { MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID } from "@/lib/marketplace/marketplace-commission-model-p2-118-policy";

export type CommissionCapabilityBlock = {
  id: string;
  label: string;
  status: "ready" | "partial" | "missing";
  summary: string;
  amountUsd: number;
};

export type MarketplaceCommissionModelReport = {
  policyId: typeof MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID;
  commissionRevenue30dUsd: number;
  featuredRevenue30dUsd: number;
  leadFeeRevenue30dUsd: number;
  transactionFeeRevenue30dUsd: number;
  activeFeaturedSlots: number;
  newBuyerLeads30d: number;
  transactionCount30d: number;
  blocks: CommissionCapabilityBlock[];
  readinessScore: number;
};

function blockStatus(amountUsd: number, count = 0): "ready" | "partial" | "missing" {
  if (amountUsd >= 100 || count >= 3) return "ready";
  if (amountUsd > 0 || count >= 1) return "partial";
  return "missing";
}

export function buildVendorCommissionBlock(
  commissionRevenue30dUsd: number,
): CommissionCapabilityBlock {
  return {
    id: "vendor-commission",
    label: "Vendor commission",
    status: blockStatus(commissionRevenue30dUsd),
    amountUsd: commissionRevenue30dUsd,
    summary:
      commissionRevenue30dUsd > 0
        ? `$${commissionRevenue30dUsd.toFixed(2)} commission (30d) — verify plan-tier rates before payout`
        : "No commission revenue yet — accrues when marketplace POs complete checkout",
  };
}

export function buildFeaturedPlacementBlock(
  featuredRevenue30dUsd: number,
  activeFeaturedSlots: number,
): CommissionCapabilityBlock {
  return {
    id: "featured-placement",
    label: "Featured placement",
    status: blockStatus(featuredRevenue30dUsd, activeFeaturedSlots),
    amountUsd: featuredRevenue30dUsd,
    summary:
      activeFeaturedSlots > 0
        ? `${activeFeaturedSlots} active slot(s) · $${featuredRevenue30dUsd.toFixed(2)} (30d) — typical weekly slot pricing`
        : "No featured slots — vendors purchase homepage or category placement in vendor cabinet",
  };
}

export function buildLeadFeeBlock(
  leadFeeRevenue30dUsd: number,
  newBuyerLeads30d: number,
): CommissionCapabilityBlock {
  return {
    id: "lead-fee",
    label: "Lead fee",
    status: blockStatus(leadFeeRevenue30dUsd, newBuyerLeads30d),
    amountUsd: leadFeeRevenue30dUsd,
    summary:
      newBuyerLeads30d > 0
        ? `${newBuyerLeads30d} new buyer lead(s) · $${leadFeeRevenue30dUsd.toFixed(2)} (30d) — directional, not certified CPA`
        : "No lead fees yet — charged on first marketplace PO from new buyers",
  };
}

export function buildTransactionFeeBlock(
  transactionFeeRevenue30dUsd: number,
  transactionCount30d: number,
): CommissionCapabilityBlock {
  return {
    id: "transaction-fee",
    label: "Transaction fee",
    status: blockStatus(transactionFeeRevenue30dUsd, transactionCount30d),
    amountUsd: transactionFeeRevenue30dUsd,
    summary:
      transactionCount30d > 0
        ? `${transactionCount30d} transaction(s) · $${transactionFeeRevenue30dUsd.toFixed(2)} fees (30d) — Stripe Connect application fee`
        : "No transaction fees yet — captured at checkout via Stripe Connect",
  };
}

export function computeCommissionReadinessScore(blocks: CommissionCapabilityBlock[]): number {
  if (blocks.length === 0) return 0;
  const weights = { ready: 1, partial: 0.5, missing: 0 };
  const total = blocks.reduce((sum, block) => sum + weights[block.status], 0);
  return Math.round((total / blocks.length) * 100);
}

export function buildMarketplaceCommissionModelReport(input: {
  commissionRevenue30dUsd?: number;
  featuredRevenue30dUsd?: number;
  leadFeeRevenue30dUsd?: number;
  transactionFeeRevenue30dUsd?: number;
  activeFeaturedSlots?: number;
  newBuyerLeads30d?: number;
  transactionCount30d?: number;
}): MarketplaceCommissionModelReport {
  const commissionRevenue30dUsd = input.commissionRevenue30dUsd ?? 0;
  const featuredRevenue30dUsd = input.featuredRevenue30dUsd ?? 0;
  const leadFeeRevenue30dUsd = input.leadFeeRevenue30dUsd ?? 0;
  const transactionFeeRevenue30dUsd = input.transactionFeeRevenue30dUsd ?? 0;
  const activeFeaturedSlots = input.activeFeaturedSlots ?? 0;
  const newBuyerLeads30d = input.newBuyerLeads30d ?? 0;
  const transactionCount30d = input.transactionCount30d ?? 0;

  const blocks = [
    buildVendorCommissionBlock(commissionRevenue30dUsd),
    buildFeaturedPlacementBlock(featuredRevenue30dUsd, activeFeaturedSlots),
    buildLeadFeeBlock(leadFeeRevenue30dUsd, newBuyerLeads30d),
    buildTransactionFeeBlock(transactionFeeRevenue30dUsd, transactionCount30d),
  ];

  return {
    policyId: MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID,
    commissionRevenue30dUsd,
    featuredRevenue30dUsd,
    leadFeeRevenue30dUsd,
    transactionFeeRevenue30dUsd,
    activeFeaturedSlots,
    newBuyerLeads30d,
    transactionCount30d,
    blocks,
    readinessScore: computeCommissionReadinessScore(blocks),
  };
}

export function buildMarketplaceCommissionModelDemoReport(): MarketplaceCommissionModelReport {
  return buildMarketplaceCommissionModelReport({
    commissionRevenue30dUsd: 4280.5,
    featuredRevenue30dUsd: 890,
    leadFeeRevenue30dUsd: 450,
    transactionFeeRevenue30dUsd: 4280.5,
    activeFeaturedSlots: 6,
    newBuyerLeads30d: 9,
    transactionCount30d: 142,
  });
}

export function hasActiveCommissionRevenue(report: MarketplaceCommissionModelReport): boolean {
  return (
    report.commissionRevenue30dUsd > 0 ||
    report.featuredRevenue30dUsd > 0 ||
    report.transactionCount30d > 0
  );
}

/** Typical flat lead fee per new buyer first PO (USD). */
export const MARKETPLACE_LEAD_FEE_USD = 50;
