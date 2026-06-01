import type { Prisma } from "@prisma/client";

import {
  isLikelyGtinQuery,
  type MarketplaceCompareFilters,
  type MarketplaceCompareSort,
} from "@/lib/marketplace/compare-filters";
import { prisma } from "@/lib/prisma";

export type MarketplaceCompareRow = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  gtin: string | null;
  vendorId: string;
  vendorName: string;
  basePrice: number;
  currency: string;
  moq: number;
  leadTimeDays: number;
  avgVendorRating: number | null;
  reviewCount: number;
  inStock: boolean;
  isBestPrice: boolean;
};

export type MarketplaceCompareResult = {
  queryLabel: string;
  matchKind: "name" | "gtin" | "products" | "empty";
  rows: MarketplaceCompareRow[];
  total: number;
};

const MAX_COMPARE_ROWS = 50;

function decimalToNumber(value: { toString(): string } | number): number {
  return typeof value === "number" ? value : Number(value.toString());
}

async function loadVendorRatingMap(): Promise<Map<string, { avg: number; count: number }>> {
  const rows = await prisma.marketplaceVendorReview.groupBy({
    by: ["vendorId"],
    _avg: { overall: true },
    _count: { _all: true },
  });

  const map = new Map<string, { avg: number; count: number }>();
  for (const row of rows) {
    if (row._avg.overall == null) continue;
    map.set(row.vendorId, {
      avg: Math.round(Number(row._avg.overall) * 10) / 10,
      count: row._count._all,
    });
  }
  return map;
}

function baseProductWhere(): Prisma.VendorProductWhereInput {
  return {
    status: "ACTIVE",
    vendor: { status: "APPROVED" },
  };
}

function buildSearchWhere(filters: MarketplaceCompareFilters): Prisma.VendorProductWhereInput {
  const and: Prisma.VendorProductWhereInput[] = [baseProductWhere()];

  if (filters.products.length > 0) {
    and.push({ slug: { in: filters.products } });
    return { AND: and };
  }

  if (!filters.q) {
    return { AND: and };
  }

  if (isLikelyGtinQuery(filters.q)) {
    and.push({ gtin: filters.q.replace(/\s+/g, "") });
    return { AND: and };
  }

  and.push({
    OR: [
      { name: { contains: filters.q, mode: "insensitive" } },
      { sku: { contains: filters.q, mode: "insensitive" } },
      { gtin: { contains: filters.q, mode: "insensitive" } },
    ],
  });

  return { AND: and };
}

function sortCompareRows(rows: MarketplaceCompareRow[], sort: MarketplaceCompareSort): MarketplaceCompareRow[] {
  const copy = [...rows];
  switch (sort) {
    case "price_desc":
      return copy.sort((a, b) => b.basePrice - a.basePrice);
    case "rating_desc":
      return copy.sort((a, b) => (b.avgVendorRating ?? 0) - (a.avgVendorRating ?? 0));
    case "delivery_asc":
      return copy.sort((a, b) => a.leadTimeDays - b.leadTimeDays);
    case "moq_asc":
      return copy.sort((a, b) => a.moq - b.moq);
    case "price_asc":
    default:
      return copy.sort((a, b) => a.basePrice - b.basePrice);
  }
}

function markBestPrice(rows: MarketplaceCompareRow[]): MarketplaceCompareRow[] {
  if (rows.length === 0) return rows;
  const minPrice = Math.min(...rows.map((row) => row.basePrice));
  return rows.map((row) => ({ ...row, isBestPrice: row.basePrice === minPrice }));
}

export async function loadMarketplaceCompare(
  filters: MarketplaceCompareFilters,
): Promise<MarketplaceCompareResult> {
  const where = buildSearchWhere(filters);
  const ratings = await loadVendorRatingMap();

  const products = await prisma.vendorProduct.findMany({
    where,
    include: { vendor: { select: { id: true, companyName: true } } },
    take: MAX_COMPARE_ROWS,
    orderBy: { basePrice: "asc" },
  });

  const rows = products.map((product) => {
    const rating = ratings.get(product.vendor.id);
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      gtin: product.gtin,
      vendorId: product.vendor.id,
      vendorName: product.vendor.companyName,
      basePrice: decimalToNumber(product.basePrice),
      currency: product.currency,
      moq: product.moq,
      leadTimeDays: product.leadTimeDays,
      avgVendorRating: rating?.avg ?? null,
      reviewCount: rating?.count ?? 0,
      inStock: product.stockQty > 0 || product.allowBackorder,
      isBestPrice: false,
    };
  });

  const sorted = markBestPrice(sortCompareRows(rows, filters.sort));

  let matchKind: MarketplaceCompareResult["matchKind"] = "empty";
  let queryLabel = "Search by product name or GTIN";

  if (filters.products.length > 0) {
    matchKind = "products";
    queryLabel = `${filters.products.length} selected product${filters.products.length === 1 ? "" : "s"}`;
  } else if (filters.q) {
    matchKind = isLikelyGtinQuery(filters.q) ? "gtin" : "name";
    queryLabel = filters.q;
  }

  return {
    queryLabel,
    matchKind,
    rows: sorted,
    total: sorted.length,
  };
}
