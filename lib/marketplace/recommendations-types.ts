import type { BusinessType } from "@prisma/client";

export type MarketplaceRecommendationProduct = {
  id: string;
  name: string;
  slug: string;
  vendorName: string;
  basePrice: number;
  currency: string;
  priceUnit: string;
  leadTimeDays: number;
  inStock: boolean;
  reason?: string;
};

export type MarketplaceRecommendationBundle = {
  personalized: MarketplaceRecommendationProduct[];
  popularInRegion: MarketplaceRecommendationProduct[];
  frequentlyBoughtTogether: MarketplaceRecommendationProduct[];
  similarProducts: MarketplaceRecommendationProduct[];
};

const BUSINESS_TYPE_CATEGORY_SLUGS: Partial<Record<BusinessType, readonly string[]>> = {
  RESTAURANT: ["kitchenware-tools", "dry-goods", "packaging-disposables", "cleaning-sanitation"],
  CAFE: ["packaging-disposables", "dry-goods", "equipment", "kitchenware-tools"],
  BAKERY: ["dry-goods", "packaging-disposables", "kitchenware-tools", "equipment"],
  CATERING: ["packaging-disposables", "kitchenware-tools", "equipment", "uniforms"],
  MEAL_PREP: ["packaging-disposables", "dry-goods", "cleaning-sanitation", "kitchenware-tools"],
  BAR: ["dry-goods", "packaging-disposables", "equipment", "cleaning-sanitation"],
  GHOST_KITCHEN: ["packaging-disposables", "equipment", "cleaning-sanitation", "services"],
  CLOUD_KITCHEN: ["packaging-disposables", "equipment", "cleaning-sanitation", "services"],
  MULTI_BRAND: ["packaging-disposables", "equipment", "dry-goods", "services"],
  OTHER: ["packaging-disposables", "cleaning-sanitation", "dry-goods", "kitchenware-tools"],
};

export function recommendationCategorySlugsForBusinessType(
  businessType: BusinessType | null | undefined,
): readonly string[] {
  if (!businessType) {
    return BUSINESS_TYPE_CATEGORY_SLUGS.OTHER ?? ["packaging-disposables", "dry-goods"];
  }
  return BUSINESS_TYPE_CATEGORY_SLUGS[businessType] ?? BUSINESS_TYPE_CATEGORY_SLUGS.OTHER ?? [];
}

export function mergeRecommendationCategorySlugs(
  ...groups: Array<readonly string[] | string[]>
): string[] {
  return [...new Set(groups.flat().filter(Boolean))];
}

export function rankRecommendationProducts<T extends { id: string }>(
  products: T[],
  priorityIds: readonly string[],
): T[] {
  if (priorityIds.length === 0) return products;
  const rank = new Map(priorityIds.map((id, index) => [id, index]));
  return [...products].sort((a, b) => {
    const aRank = rank.get(a.id);
    const bRank = rank.get(b.id);
    if (aRank != null && bRank != null) return aRank - bRank;
    if (aRank != null) return -1;
    if (bRank != null) return 1;
    return 0;
  });
}
