import type { SUPPLIER_MARKETPLACE_POLICY_ID, SupplierMarketplaceLaneId } from "@/lib/marketplace/supplier-marketplace-policy";

export type SupplierLaneProduct = {
  id: string;
  name: string;
  slug: string;
  vendorName: string;
  basePrice: number;
  currency: string;
  priceUnit: string;
  inStock: boolean;
};

export type SupplierOneClickReorder = {
  id: string;
  lane: SupplierMarketplaceLaneId;
  productId: string;
  productName: string;
  slug: string;
  sku: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  lastOrderedAtIso: string;
};

export type SupplierLaneSnapshot = {
  lane: SupplierMarketplaceLaneId;
  label: string;
  description: string;
  productCount: number;
  vendorCount: number;
  catalogHref: string;
  topProducts: SupplierLaneProduct[];
  oneClickReorder: SupplierOneClickReorder | null;
};

export type SupplierMarketplaceDashboard = {
  policyId: typeof SUPPLIER_MARKETPLACE_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  lanes: SupplierLaneSnapshot[];
  oneClickReorders: SupplierOneClickReorder[];
  summary: {
    totalSkus: number;
    totalVendors: number;
    lanesWithReorder: number;
  };
  basePath: string;
};
