export type MarketplaceFeaturedSlot =
  | "homepage_hero"
  | "catalog_top"
  | "category_spotlight"
  | "search_boost";

export type MarketplaceFeaturedPlacementStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "expired"
  | "cancelled";

export type MarketplaceFeaturedPerformanceEvent = "view" | "click" | "conversion";

export type MarketplaceFeaturedPlacementPerformance = {
  views: number;
  clicks: number;
  conversions: number;
};

export type MarketplaceFeaturedPlacement = {
  id: string;
  vendorId: string;
  productId: string | null;
  productSlug: string | null;
  productName: string | null;
  slot: MarketplaceFeaturedSlot;
  status: MarketplaceFeaturedPlacementStatus;
  periodStart: string;
  periodEnd: string;
  paidAmountUsd: number;
  currency: string;
  label: string | null;
  performance: MarketplaceFeaturedPlacementPerformance;
  createdAt: string;
  updatedAt: string;
};

export type MarketplaceFeaturedPlacementsDocument = {
  kind: "featured_placements";
  placements: MarketplaceFeaturedPlacement[];
  updatedAt: string;
};

export type MarketplaceFeaturedPromotion = {
  placementId: string;
  vendorId: string;
  vendorName: string;
  productId: string | null;
  productSlug: string | null;
  productName: string | null;
  slot: MarketplaceFeaturedSlot;
  label: string | null;
  periodEnd: string;
  performance: MarketplaceFeaturedPlacementPerformance;
};

export const MARKETPLACE_FEATURED_SLOT_PRICING_USD: Record<
  MarketplaceFeaturedSlot,
  { weeklyUsd: number; label: string }
> = {
  homepage_hero: { weeklyUsd: 299, label: "Homepage hero banner" },
  catalog_top: { weeklyUsd: 149, label: "Catalog top row" },
  category_spotlight: { weeklyUsd: 99, label: "Category spotlight" },
  search_boost: { weeklyUsd: 49, label: "Search boost badge" },
};

export function featuredSlotPriceUsd(slot: MarketplaceFeaturedSlot, weeks = 1): number {
  const unit = MARKETPLACE_FEATURED_SLOT_PRICING_USD[slot]?.weeklyUsd ?? 0;
  return Math.round(unit * Math.max(1, weeks) * 100) / 100;
}

export function resolveFeaturedPlacementStatus(
  placement: Pick<MarketplaceFeaturedPlacement, "status" | "periodStart" | "periodEnd">,
  now = new Date(),
): MarketplaceFeaturedPlacementStatus {
  if (placement.status === "cancelled" || placement.status === "draft") {
    return placement.status;
  }
  const start = new Date(placement.periodStart);
  const end = new Date(placement.periodEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return placement.status;
  }
  if (now < start) return "scheduled";
  if (now > end) return "expired";
  return placement.status === "scheduled" ? "active" : placement.status;
}

export function isFeaturedPlacementActive(
  placement: Pick<MarketplaceFeaturedPlacement, "status" | "periodStart" | "periodEnd">,
  now = new Date(),
): boolean {
  const status = resolveFeaturedPlacementStatus(placement, now);
  return status === "active";
}

export function sumFeaturedPlacementRevenue(
  placements: readonly MarketplaceFeaturedPlacement[],
  since: Date,
): number {
  return round2(
    placements.reduce((sum, placement) => {
      if (placement.paidAmountUsd <= 0) return sum;
      const createdAt = new Date(placement.createdAt);
      if (Number.isNaN(createdAt.getTime()) || createdAt < since) return sum;
      if (placement.status === "cancelled" || placement.status === "draft") return sum;
      return sum + placement.paidAmountUsd;
    }, 0),
  );
}

export function applyFeaturedPerformanceEvent(
  performance: MarketplaceFeaturedPlacementPerformance,
  event: MarketplaceFeaturedPerformanceEvent,
): MarketplaceFeaturedPlacementPerformance {
  if (event === "view") {
    return { ...performance, views: performance.views + 1 };
  }
  if (event === "click") {
    return { ...performance, clicks: performance.clicks + 1 };
  }
  return { ...performance, conversions: performance.conversions + 1 };
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePerformance(raw: unknown): MarketplaceFeaturedPlacementPerformance {
  if (!isPlainObject(raw)) return { views: 0, clicks: 0, conversions: 0 };
  return {
    views: typeof raw.views === "number" && raw.views >= 0 ? raw.views : 0,
    clicks: typeof raw.clicks === "number" && raw.clicks >= 0 ? raw.clicks : 0,
    conversions: typeof raw.conversions === "number" && raw.conversions >= 0 ? raw.conversions : 0,
  };
}

function parseSlot(value: unknown): MarketplaceFeaturedSlot | null {
  return value === "homepage_hero" ||
    value === "catalog_top" ||
    value === "category_spotlight" ||
    value === "search_boost"
    ? value
    : null;
}

function parseStatus(value: unknown): MarketplaceFeaturedPlacementStatus | null {
  return value === "draft" ||
    value === "scheduled" ||
    value === "active" ||
    value === "expired" ||
    value === "cancelled"
    ? value
    : null;
}

function parsePlacement(raw: unknown, vendorId: string): MarketplaceFeaturedPlacement | null {
  if (!isPlainObject(raw)) return null;
  if (typeof raw.id !== "string") return null;
  const slot = parseSlot(raw.slot);
  const status = parseStatus(raw.status);
  if (!slot || !status) return null;

  return {
    id: raw.id,
    vendorId,
    productId: typeof raw.productId === "string" ? raw.productId : null,
    productSlug: typeof raw.productSlug === "string" ? raw.productSlug : null,
    productName: typeof raw.productName === "string" ? raw.productName : null,
    slot,
    status,
    periodStart: typeof raw.periodStart === "string" ? raw.periodStart : new Date().toISOString(),
    periodEnd: typeof raw.periodEnd === "string" ? raw.periodEnd : new Date().toISOString(),
    paidAmountUsd: typeof raw.paidAmountUsd === "number" ? raw.paidAmountUsd : 0,
    currency: typeof raw.currency === "string" ? raw.currency : "USD",
    label: typeof raw.label === "string" ? raw.label : null,
    performance: parsePerformance(raw.performance),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
  };
}

export function defaultFeaturedPlacementsDocument(): MarketplaceFeaturedPlacementsDocument {
  const iso = new Date().toISOString();
  return { kind: "featured_placements", placements: [], updatedAt: iso };
}

export function parseFeaturedPlacementsDocument(
  documents: unknown,
  vendorId: string,
): MarketplaceFeaturedPlacementsDocument {
  if (!Array.isArray(documents)) return defaultFeaturedPlacementsDocument();
  const entry = documents.find(
    (item): item is MarketplaceFeaturedPlacementsDocument =>
      isPlainObject(item) && item.kind === "featured_placements",
  );
  if (!entry) return defaultFeaturedPlacementsDocument();

  return {
    kind: "featured_placements",
    placements: Array.isArray(entry.placements)
      ? entry.placements
          .map((row) => parsePlacement(row, vendorId))
          .filter((row): row is MarketplaceFeaturedPlacement => row != null)
      : [],
    updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date().toISOString(),
  };
}

export function mergeFeaturedPlacementsIntoDocuments(
  documents: unknown,
  featured: MarketplaceFeaturedPlacementsDocument,
): unknown[] {
  const list = Array.isArray(documents)
    ? documents.filter((doc) => !isPlainObject(doc) || doc.kind !== "featured_placements")
    : [];
  return [...list, featured];
}

export function toFeaturedPromotion(
  placement: MarketplaceFeaturedPlacement,
  vendorName: string,
): MarketplaceFeaturedPromotion {
  return {
    placementId: placement.id,
    vendorId: placement.vendorId,
    vendorName,
    productId: placement.productId,
    productSlug: placement.productSlug,
    productName: placement.productName,
    slot: placement.slot,
    label: placement.label,
    periodEnd: placement.periodEnd,
    performance: placement.performance,
  };
}
