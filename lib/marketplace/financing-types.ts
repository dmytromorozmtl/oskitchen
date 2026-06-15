import type { MARKETPLACE_FINANCING_POLICY_ID, MarketplaceNetTermsDays } from "@/lib/marketplace/financing-policy";

export type MarketplaceFinancingTermProduct = {
  days: MarketplaceNetTermsDays;
  label: string;
  description: string;
  eligible: boolean;
  requirement: string;
  isActive: boolean;
};

export type MarketplaceEarlyPaymentOffer = {
  id: string;
  scheduleId: string;
  orderId: string;
  poNumber: string | null;
  dueDateIso: string;
  amountUsd: number;
  discountPercent: number;
  discountUsd: number;
  payByIso: string;
  status: "available" | "expired";
};

export type MarketplaceFactoringOffer = {
  id: string;
  partnerSlug: string;
  partnerName: string;
  title: string;
  receivablesUsd: number;
  advanceRatePercent: number;
  advanceUsd: number;
  feePercent: number;
  deepLink: string | null;
};

export type MarketplaceFinancingSnapshot = {
  policyId: typeof MARKETPLACE_FINANCING_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  currency: string;
  creditLine: {
    limitUsd: number;
    usedUsd: number;
    availableUsd: number;
    activeNetTermsDays: number;
    source: string;
  };
  termProducts: MarketplaceFinancingTermProduct[];
  earlyPaymentOffers: MarketplaceEarlyPaymentOffer[];
  factoringOffers: MarketplaceFactoringOffer[];
  summary: {
    openSchedules: number;
    earlyPaymentSavingsUsd: number;
    factoringEligibleUsd: number;
    activeTermLabel: string;
  };
  basePath: string;
};
