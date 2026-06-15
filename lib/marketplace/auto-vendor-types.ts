export type AutoVendorOpportunityKind = "savings" | "price_increase";

export type AutoVendorOpportunity = {
  id: string;
  kind: AutoVendorOpportunityKind;
  categoryLabel: string;
  currentLabel: string;
  currentVendorName: string;
  currentUnitPrice: number;
  currency: string;
  priceChangePercent: number | null;
  alternativeVendorName: string;
  alternativeProductName: string;
  alternativeProductSlug: string;
  alternativeUnitPrice: number;
  monthlySavingsUsd: number;
  confidence: "high" | "medium";
  rationale: string;
};

export type AutoVendorDashboard = {
  opportunities: AutoVendorOpportunity[];
  summary: {
    totalMonthlySavingsUsd: number;
    savingsCount: number;
    priceIncreaseCount: number;
    itemsScanned: number;
  };
  scannedAt: string;
};
