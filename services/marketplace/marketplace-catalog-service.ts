import type { Prisma } from "@prisma/client";

import {
  MARKETPLACE_CATALOG_PAGE_SIZE,
  type MarketplaceCatalogCategoryNode,
  type MarketplaceCatalogFilters,
  buildMarketplaceCategoryTree,
} from "@/lib/marketplace/catalog-filters";
import { prisma } from "@/lib/prisma";
import type { MarketplaceProductCard } from "@/services/marketplace/marketplace-dashboard-service";

export type MarketplaceCatalogProduct = MarketplaceProductCard & {
  moq: number;
  gtin: string | null;
  avgVendorRating: number | null;
  reviewCount: number;
};

export type MarketplaceCatalogVendorOption = {
  id: string;
  companyName: string;
};

export type MarketplaceCatalogResult = {
  items: MarketplaceCatalogProduct[];
  total: number;
  page: number;
  totalPages: number;
  categories: MarketplaceCatalogCategoryNode[];
  vendors: MarketplaceCatalogVendorOption[];
};

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

async function resolveCategoryIds(slug: string): Promise<string[] | null> {
  if (!slug) return null;

  const selected = await prisma.marketplaceProductCategory.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!selected) return [];

  const allCategories = await prisma.marketplaceProductCategory.findMany({
    select: { id: true, parentId: true },
  });

  const childrenByParent = new Map<string, string[]>();
  for (const category of allCategories) {
    if (!category.parentId) continue;
    const list = childrenByParent.get(category.parentId) ?? [];
    list.push(category.id);
    childrenByParent.set(category.parentId, list);
  }

  const ids = new Set<string>([selected.id]);
  const queue = [selected.id];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const childId of childrenByParent.get(current) ?? []) {
      if (ids.has(childId)) continue;
      ids.add(childId);
      queue.push(childId);
    }
  }

  return [...ids];
}

function mapProduct(
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    gtin: string | null;
    basePrice: { toString(): string };
    currency: string;
    priceUnit: string;
    leadTimeDays: number;
    stockQty: number;
    allowBackorder: boolean;
    moq: number;
    vendor: { id: string; companyName: string };
  },
  ratings: Map<string, { avg: number; count: number }>,
): MarketplaceCatalogProduct {
  const rating = ratings.get(product.vendor.id);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    vendorName: product.vendor.companyName,
    basePrice: decimalToNumber(product.basePrice),
    currency: product.currency,
    priceUnit: product.priceUnit,
    leadTimeDays: product.leadTimeDays,
    inStock: product.stockQty > 0 || product.allowBackorder,
    moq: product.moq,
    gtin: product.gtin,
    avgVendorRating: rating?.avg ?? null,
    reviewCount: rating?.count ?? 0,
  };
}

function buildWhere(
  filters: MarketplaceCatalogFilters,
  categoryIds: string[] | null,
  vendorIdsByRating: string[] | null,
): Prisma.VendorProductWhereInput {
  const and: Prisma.VendorProductWhereInput[] = [
    { status: "ACTIVE" },
    { vendor: { status: "APPROVED" } },
  ];

  if (filters.q) {
    and.push({
      OR: [
        { name: { contains: filters.q, mode: "insensitive" } },
        { sku: { contains: filters.q, mode: "insensitive" } },
        { gtin: { contains: filters.q, mode: "insensitive" } },
        { vendor: { companyName: { contains: filters.q, mode: "insensitive" } } },
      ],
    });
  }

  if (categoryIds) {
    and.push({ categoryId: { in: categoryIds } });
  }

  if (filters.vendorId) {
    and.push({ vendorId: filters.vendorId });
  }

  if (vendorIdsByRating) {
    and.push({ vendorId: { in: vendorIdsByRating } });
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    and.push({
      basePrice: {
        ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
      },
    });
  }

  if (filters.maxLeadDays != null) {
    and.push({ leadTimeDays: { lte: filters.maxLeadDays } });
  }

  if (filters.maxMoq != null) {
    and.push({ moq: { lte: filters.maxMoq } });
  }

  if (filters.inStockOnly) {
    and.push({ stockQty: { gt: 0 } });
  }

  return { AND: and };
}

function sortProducts(
  products: MarketplaceCatalogProduct[],
  sort: MarketplaceCatalogFilters["sort"],
): MarketplaceCatalogProduct[] {
  const copy = [...products];
  switch (sort) {
    case "price_asc":
      return copy.sort((a, b) => a.basePrice - b.basePrice);
    case "price_desc":
      return copy.sort((a, b) => b.basePrice - a.basePrice);
    case "newest":
      return copy;
    case "rating_desc":
      return copy.sort((a, b) => (b.avgVendorRating ?? 0) - (a.avgVendorRating ?? 0));
    case "popularity":
    default:
      return copy;
  }
}

export async function loadMarketplaceCatalog(
  filters: MarketplaceCatalogFilters,
): Promise<MarketplaceCatalogResult> {
  const [categoryRows, vendorOptions, ratings, categoryIds] = await Promise.all([
    prisma.marketplaceProductCategory.findMany({
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        level: true,
        parentId: true,
        sortOrder: true,
      },
    }),
    prisma.vendor.findMany({
      where: { status: "APPROVED", products: { some: { status: "ACTIVE" } } },
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
    loadVendorRatingMap(),
    resolveCategoryIds(filters.category),
  ]);

  const vendorIdsByRating =
    filters.minRating != null
      ? [...ratings.entries()]
          .filter(([, value]) => value.avg >= filters.minRating!)
          .map(([vendorId]) => vendorId)
      : null;

  const where = buildWhere(filters, categoryIds, vendorIdsByRating);

  const productInclude = {
    vendor: { select: { id: true, companyName: true } },
  } as const;

  if (filters.sort === "rating_desc") {
    const allProducts = await prisma.vendorProduct.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: "desc" },
    });
    const mapped = sortProducts(allProducts.map((product) => mapProduct(product, ratings)), filters.sort);
    const total = mapped.length;
    const totalPages = Math.max(1, Math.ceil(total / MARKETPLACE_CATALOG_PAGE_SIZE));
    const page = Math.min(filters.page, totalPages);
    const skip = (page - 1) * MARKETPLACE_CATALOG_PAGE_SIZE;
    return {
      items: mapped.slice(skip, skip + MARKETPLACE_CATALOG_PAGE_SIZE),
      total,
      page,
      totalPages,
      categories: buildMarketplaceCategoryTree(categoryRows),
      vendors: vendorOptions,
    };
  }

  const orderBy: Prisma.VendorProductOrderByWithRelationInput[] =
    filters.sort === "price_asc"
      ? [{ basePrice: "asc" }]
      : filters.sort === "price_desc"
        ? [{ basePrice: "desc" }]
        : filters.sort === "newest"
          ? [{ createdAt: "desc" }]
          : [{ updatedAt: "desc" }];

  const total = await prisma.vendorProduct.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / MARKETPLACE_CATALOG_PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const skip = (page - 1) * MARKETPLACE_CATALOG_PAGE_SIZE;

  const products = await prisma.vendorProduct.findMany({
    where,
    include: productInclude,
    orderBy,
    skip,
    take: MARKETPLACE_CATALOG_PAGE_SIZE,
  });

  return {
    items: products.map((product) => mapProduct(product, ratings)),
    total,
    page,
    totalPages,
    categories: buildMarketplaceCategoryTree(categoryRows),
    vendors: vendorOptions,
  };
}
