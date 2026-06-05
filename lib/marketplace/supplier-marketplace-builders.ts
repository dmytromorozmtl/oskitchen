import {
  SUPPLIER_LANE_CATEGORY_SLUGS,
  SUPPLIER_MARKETPLACE_PATH,
  SUPPLIER_MARKETPLACE_POLICY_ID,
  type SupplierMarketplaceLaneId,
} from "@/lib/marketplace/supplier-marketplace-policy";
import type {
  SupplierLaneProduct,
  SupplierLaneSnapshot,
  SupplierMarketplaceDashboard,
  SupplierOneClickReorder,
} from "@/lib/marketplace/supplier-marketplace-types";

const LANE_META: Record<
  SupplierMarketplaceLaneId,
  { label: string; description: string }
> = {
  food: {
    label: "Food & ingredients",
    description: "Dry goods, staples, and kitchen ingredients from verified food distributors.",
  },
  packaging: {
    label: "Packaging & disposables",
    description: "Containers, bags, labels, and to-go supplies with MOQ-friendly case packs.",
  },
  equipment: {
    label: "Equipment & tools",
    description: "Smallwares, refrigeration, and back-of-house equipment from HoReCa suppliers.",
  },
};

export type SupplierLaneRawInput = {
  lane: SupplierMarketplaceLaneId;
  productCount: number;
  vendorCount: number;
  topProducts: SupplierLaneProduct[];
  oneClickReorder: SupplierOneClickReorder | null;
};

export function buildSupplierLaneCatalogHref(lane: SupplierMarketplaceLaneId): string {
  const slug = SUPPLIER_LANE_CATEGORY_SLUGS[lane][0];
  return `/dashboard/marketplace/catalog?category=${slug}`;
}

export function buildSupplierLaneSnapshot(input: SupplierLaneRawInput): SupplierLaneSnapshot {
  const meta = LANE_META[input.lane];
  return {
    lane: input.lane,
    label: meta.label,
    description: meta.description,
    productCount: input.productCount,
    vendorCount: input.vendorCount,
    catalogHref: buildSupplierLaneCatalogHref(input.lane),
    topProducts: input.topProducts,
    oneClickReorder: input.oneClickReorder,
  };
}

export function buildSupplierMarketplaceDashboard(input: {
  workspaceId: string;
  lanes: SupplierLaneSnapshot[];
  analyzedAt?: Date;
}): SupplierMarketplaceDashboard {
  const oneClickReorders = input.lanes
    .map((lane) => lane.oneClickReorder)
    .filter((row): row is SupplierOneClickReorder => row != null);

  const vendorIds = new Set<string>();
  let totalSkus = 0;
  for (const lane of input.lanes) {
    totalSkus += lane.productCount;
    if (lane.oneClickReorder) vendorIds.add(lane.oneClickReorder.vendorId);
  }

  return {
    policyId: SUPPLIER_MARKETPLACE_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    lanes: input.lanes,
    oneClickReorders,
    summary: {
      totalSkus,
      totalVendors: input.lanes.reduce((sum, lane) => sum + lane.vendorCount, 0),
      lanesWithReorder: oneClickReorders.length,
    },
    basePath: SUPPLIER_MARKETPLACE_PATH,
  };
}
