import type { PRICE_INTELLIGENCE_POLICY_ID } from "@/lib/marketplace/price-intelligence-policy";

export type PriceIntelligenceAutoSwitchPolicy = {
  enabled: boolean;
  minSavingsPercent: number;
};

export type PriceIntelligenceSwitchRecommendation = {
  id: string;
  productName: string;
  categoryLabel: string;
  currentProductId: string;
  currentProductSlug: string;
  currentVendorId: string;
  currentVendorName: string;
  currentUnitPrice: number;
  cheapestProductId: string;
  cheapestProductSlug: string;
  cheapestVendorId: string;
  cheapestVendorName: string;
  cheapestUnitPrice: number;
  currency: string;
  quantityLast90Days: number;
  savingsPercent: number;
  monthlySavingsUsd: number;
  autoSwitchEligible: boolean;
  compareHref: string;
};

export type PriceIntelligenceCheapestLeader = {
  productId: string;
  productName: string;
  slug: string;
  vendorName: string;
  unitPrice: number;
  currency: string;
  spreadPercent: number;
  offerCount: number;
};

export type PriceIntelligenceSnapshot = {
  policyId: typeof PRICE_INTELLIGENCE_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  autoSwitch: PriceIntelligenceAutoSwitchPolicy;
  recommendations: PriceIntelligenceSwitchRecommendation[];
  cheapestLeaders: PriceIntelligenceCheapestLeader[];
  summary: {
    switchesAvailable: number;
    autoSwitchReady: number;
    totalMonthlySavingsUsd: number;
    itemsScanned: number;
  };
  basePath: string;
};
