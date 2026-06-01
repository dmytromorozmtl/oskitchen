import type {
  MarketplaceCurrency,
  MarketplacePriceUnit,
  MarketplaceProductStatus,
  MarketplaceStorageRequirement,
  MarketplaceWeightUnit,
} from "@prisma/client";

import { slugifyVendorProduct } from "@/lib/marketplace/vendor-product-filters";
import { prisma } from "@/lib/prisma";

export type VendorProductMediaItem = {
  url: string;
  alt?: string;
  sortOrder?: number;
};

export type VendorProductVariantInput = {
  id?: string;
  name: string;
  sku: string;
  price?: number | null;
  stockQty: number;
};

export type VendorVolumePriceInput = {
  id?: string;
  minQuantity: number;
  price: number;
};

export type VendorProductInput = {
  name: string;
  sku: string;
  gtin?: string | null;
  categoryId: string;
  description: string;
  richDescription?: string | null;
  basePrice: number;
  currency: MarketplaceCurrency;
  priceUnit: MarketplacePriceUnit;
  caseSize?: number | null;
  moq: number;
  orderIncrement: number;
  stockQty: number;
  minStockAlert?: number | null;
  leadTimeDays: number;
  allowBackorder: boolean;
  weight?: number | null;
  weightUnit?: MarketplaceWeightUnit | null;
  storageRequirement?: MarketplaceStorageRequirement | null;
  certifications?: string[];
  tags?: string[];
  media?: VendorProductMediaItem[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  variants?: VendorProductVariantInput[];
  volumePricing?: VendorVolumePriceInput[];
};

export type VendorProductListItem = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  status: MarketplaceProductStatus;
  basePrice: number;
  currency: string;
  stockQty: number;
  categoryName: string;
  variantCount: number;
  updatedAt: string;
};

export type VendorProductDetail = VendorProductInput & {
  id: string;
  slug: string;
  status: MarketplaceProductStatus;
  variants: VendorProductVariantInput[];
  volumePricing: VendorVolumePriceInput[];
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function parseMedia(raw: unknown): VendorProductMediaItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry): entry is VendorProductMediaItem => {
      return typeof entry === "object" && entry != null && typeof (entry as VendorProductMediaItem).url === "string";
    })
    .map((entry, index) => ({
      url: entry.url,
      alt: entry.alt,
      sortOrder: entry.sortOrder ?? index,
    }));
}

async function uniqueSlug(vendorId: string, baseSlug: string, excludeProductId?: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 1;
  while (true) {
    const existing = await prisma.vendorProduct.findFirst({
      where: {
        slug,
        ...(excludeProductId ? { NOT: { id: excludeProductId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function loadVendorProducts(input: {
  vendorId: string;
  q?: string;
  status?: MarketplaceProductStatus;
  page: number;
  pageSize: number;
}): Promise<{ items: VendorProductListItem[]; total: number; totalPages: number }> {
  const where = {
    vendorId: input.vendorId,
    ...(input.status ? { status: input.status } : {}),
    ...(input.q
      ? {
          OR: [
            { name: { contains: input.q, mode: "insensitive" as const } },
            { sku: { contains: input.q, mode: "insensitive" as const } },
            { gtin: { contains: input.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.vendorProduct.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      include: {
        category: { select: { name: true } },
        _count: { select: { variants: true } },
      },
    }),
    prisma.vendorProduct.count({ where }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      slug: row.slug,
      status: row.status,
      basePrice: decimalToNumber(row.basePrice),
      currency: row.currency,
      stockQty: row.stockQty,
      categoryName: row.category.name,
      variantCount: row._count.variants,
      updatedAt: row.updatedAt.toISOString(),
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
  };
}

export async function loadVendorProductDetail(
  vendorId: string,
  productId: string,
): Promise<VendorProductDetail | null> {
  const product = await prisma.vendorProduct.findFirst({
    where: { id: productId, vendorId },
    include: { variants: true, volumePricing: { orderBy: { minQuantity: "asc" } } },
  });
  if (!product) return null;

  return {
    id: product.id,
    slug: product.slug,
    status: product.status,
    name: product.name,
    sku: product.sku,
    gtin: product.gtin,
    categoryId: product.categoryId,
    description: product.description,
    richDescription: product.richDescription,
    basePrice: decimalToNumber(product.basePrice),
    currency: product.currency,
    priceUnit: product.priceUnit,
    caseSize: product.caseSize,
    moq: product.moq,
    orderIncrement: product.orderIncrement,
    stockQty: product.stockQty,
    minStockAlert: product.minStockAlert,
    leadTimeDays: product.leadTimeDays,
    allowBackorder: product.allowBackorder,
    weight: product.weight != null ? decimalToNumber(product.weight) : null,
    weightUnit: product.weightUnit,
    storageRequirement: product.storageRequirement,
    certifications: product.certifications,
    tags: product.tags,
    media: parseMedia(product.media),
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      price: variant.price != null ? decimalToNumber(variant.price) : null,
      stockQty: variant.stockQty,
    })),
    volumePricing: product.volumePricing.map((tier) => ({
      id: tier.id,
      minQuantity: tier.minQuantity,
      price: decimalToNumber(tier.price),
    })),
  };
}

export async function createVendorProduct(
  vendorId: string,
  input: VendorProductInput,
  status: MarketplaceProductStatus = "DRAFT",
): Promise<{ ok: true; id: string; slug: string } | { ok: false; error: string }> {
  const slug = await uniqueSlug(vendorId, slugifyVendorProduct(input.name, input.sku));

  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.vendorProduct.create({
        data: {
          vendorId,
          name: input.name.trim(),
          sku: input.sku.trim(),
          gtin: input.gtin?.trim() || null,
          categoryId: input.categoryId,
          description: input.description.trim(),
          richDescription: input.richDescription?.trim() || null,
          status,
          basePrice: input.basePrice,
          currency: input.currency,
          priceUnit: input.priceUnit,
          caseSize: input.caseSize ?? null,
          moq: input.moq,
          orderIncrement: input.orderIncrement,
          stockQty: input.stockQty,
          minStockAlert: input.minStockAlert ?? null,
          leadTimeDays: input.leadTimeDays,
          allowBackorder: input.allowBackorder,
          weight: input.weight ?? null,
          weightUnit: input.weightUnit ?? null,
          storageRequirement: input.storageRequirement ?? null,
          certifications: input.certifications ?? [],
          tags: input.tags ?? [],
          media: input.media ?? [],
          seoTitle: input.seoTitle?.trim() || null,
          seoDescription: input.seoDescription?.trim() || null,
          slug,
          variants: input.variants?.length
            ? {
                create: input.variants.map((variant) => ({
                  name: variant.name.trim(),
                  sku: variant.sku.trim(),
                  price: variant.price ?? null,
                  stockQty: variant.stockQty,
                })),
              }
            : undefined,
          volumePricing: input.volumePricing?.length
            ? {
                create: input.volumePricing.map((tier) => ({
                  minQuantity: tier.minQuantity,
                  price: tier.price,
                })),
              }
            : undefined,
        },
      });
      return created;
    });

    return { ok: true, id: product.id, slug: product.slug };
  } catch {
    return { ok: false, error: "Could not create product. Check SKU uniqueness." };
  }
}

export async function updateVendorProduct(
  vendorId: string,
  productId: string,
  input: VendorProductInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const existing = await prisma.vendorProduct.findFirst({
    where: { id: productId, vendorId },
    select: { id: true, slug: true, name: true, sku: true },
  });
  if (!existing) return { ok: false, error: "Product not found." };

  const slug =
    existing.name !== input.name.trim() || existing.sku !== input.sku.trim()
      ? await uniqueSlug(vendorId, slugifyVendorProduct(input.name, input.sku), productId)
      : existing.slug;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.vendorProduct.update({
        where: { id: productId },
        data: {
          name: input.name.trim(),
          sku: input.sku.trim(),
          gtin: input.gtin?.trim() || null,
          categoryId: input.categoryId,
          description: input.description.trim(),
          richDescription: input.richDescription?.trim() || null,
          basePrice: input.basePrice,
          currency: input.currency,
          priceUnit: input.priceUnit,
          caseSize: input.caseSize ?? null,
          moq: input.moq,
          orderIncrement: input.orderIncrement,
          stockQty: input.stockQty,
          minStockAlert: input.minStockAlert ?? null,
          leadTimeDays: input.leadTimeDays,
          allowBackorder: input.allowBackorder,
          weight: input.weight ?? null,
          weightUnit: input.weightUnit ?? null,
          storageRequirement: input.storageRequirement ?? null,
          certifications: input.certifications ?? [],
          tags: input.tags ?? [],
          media: input.media ?? [],
          seoTitle: input.seoTitle?.trim() || null,
          seoDescription: input.seoDescription?.trim() || null,
          slug,
        },
      });

      await tx.marketplaceProductVariant.deleteMany({ where: { productId } });
      if (input.variants?.length) {
        await tx.marketplaceProductVariant.createMany({
          data: input.variants.map((variant) => ({
            productId,
            name: variant.name.trim(),
            sku: variant.sku.trim(),
            price: variant.price ?? null,
            stockQty: variant.stockQty,
          })),
        });
      }

      await tx.marketplaceVolumePrice.deleteMany({ where: { productId } });
      if (input.volumePricing?.length) {
        await tx.marketplaceVolumePrice.createMany({
          data: input.volumePricing.map((tier) => ({
            productId,
            minQuantity: tier.minQuantity,
            price: tier.price,
          })),
        });
      }
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update product." };
  }
}

export async function bulkUpdateVendorProductStatus(input: {
  vendorId: string;
  productIds: string[];
  status: MarketplaceProductStatus;
}): Promise<{ ok: true; updated: number } | { ok: false; error: string }> {
  if (input.productIds.length === 0) {
    return { ok: false, error: "Select at least one product." };
  }

  const result = await prisma.vendorProduct.updateMany({
    where: { vendorId: input.vendorId, id: { in: input.productIds } },
    data: { status: input.status },
  });

  return { ok: true, updated: result.count };
}

export async function submitVendorProductsForReview(
  vendorId: string,
  productIds: string[],
): Promise<{ ok: true; updated: number } | { ok: false; error: string }> {
  return bulkUpdateVendorProductStatus({
    vendorId,
    productIds,
    status: "PENDING_REVIEW",
  });
}

export async function loadVendorProductCategories() {
  return prisma.marketplaceProductCategory.findMany({
    where: { level: 2 },
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true },
  });
}
