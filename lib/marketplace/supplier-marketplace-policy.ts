export const SUPPLIER_MARKETPLACE_POLICY_ID = "supplier-marketplace-v1" as const;

export const SUPPLIER_MARKETPLACE_PATH = "/dashboard/marketplace" as const;

export const SUPPLIER_MARKETPLACE_SERVICE = "services/marketplace/supplier-marketplace-service.ts" as const;

/** Core procurement lanes for the Supplier Marketplace hub. */
export const SUPPLIER_MARKETPLACE_LANES = ["food", "packaging", "equipment"] as const;

export type SupplierMarketplaceLaneId = (typeof SUPPLIER_MARKETPLACE_LANES)[number];

export const SUPPLIER_LANE_CATEGORY_SLUGS: Record<SupplierMarketplaceLaneId, readonly string[]> = {
  food: ["dry-goods"],
  packaging: ["packaging-disposables"],
  equipment: ["equipment", "kitchenware-tools"],
};
