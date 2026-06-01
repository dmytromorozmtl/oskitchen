import { addDays, format } from "date-fns";

import { prisma } from "@/lib/prisma";
import {
  loadFrequentlyBoughtTogether,
  loadSimilarProducts,
} from "@/services/marketplace/recommendations-service";

export type MarketplaceProductMediaItem = {
  url: string;
  alt: string;
};

export type MarketplaceVolumePriceRow = {
  minQuantity: number;
  price: number;
};

export type MarketplaceProductVariantOption = {
  id: string;
  name: string;
  sku: string;
  price: number | null;
  stockQty: number;
  attributes: Record<string, unknown>;
};

export type MarketplaceProductReviewRow = {
  id: string;
  overall: number;
  qualityScore: number;
  accuracyScore: number;
  deliveryScore: number;
  packagingScore: number;
  comment: string | null;
  createdAt: string;
};

export type MarketplaceProductDetail = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  gtin: string | null;
  description: string;
  richDescription: string | null;
  basePrice: number;
  currency: string;
  priceUnit: string;
  moq: number;
  orderIncrement: number;
  stockQty: number;
  allowBackorder: boolean;
  leadTimeDays: number;
  certifications: string[];
  attributes: Record<string, unknown>;
  tags: string[];
  media: MarketplaceProductMediaItem[];
  documents: string[];
  volumePricing: MarketplaceVolumePriceRow[];
  variants: MarketplaceProductVariantOption[];
  categoryName: string;
  vendor: {
    id: string;
    companyName: string;
    type: string;
    avgRating: number | null;
    reviewCount: number;
  };
  expectedDeliveryLabel: string;
  similarProducts: Array<{
    id: string;
    slug: string;
    name: string;
    basePrice: number;
    currency: string;
    vendorName: string;
  }>;
  boughtTogether: Array<{
    id: string;
    slug: string;
    name: string;
    basePrice: number;
    currency: string;
    vendorName: string;
  }>;
  reviews: MarketplaceProductReviewRow[];
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function parseMedia(raw: unknown): MarketplaceProductMediaItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const url = typeof record.url === "string" ? record.url : "";
      if (!url) return null;
      return {
        url,
        alt: typeof record.alt === "string" ? record.alt : "",
      };
    })
    .filter((item): item is MarketplaceProductMediaItem => item != null);
}

function parseAttributes(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, unknown>;
}

export async function loadMarketplaceProductDetail(
  slug: string,
): Promise<MarketplaceProductDetail | null> {
  const product = await prisma.vendorProduct.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      vendor: { status: "APPROVED" },
    },
    include: {
      category: { select: { id: true, name: true } },
      vendor: {
        select: {
          id: true,
          companyName: true,
          type: true,
          reviews: {
            where: { isPublic: true },
            select: {
              id: true,
              overall: true,
              qualityScore: true,
              accuracyScore: true,
              deliveryScore: true,
              packagingScore: true,
              comment: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 40,
          },
        },
      },
      volumePricing: { orderBy: { minQuantity: "asc" } },
      variants: { orderBy: { name: "asc" } },
    },
  });

  if (!product) return null;

  const [similarProducts, boughtTogether] = await Promise.all([
    loadSimilarProducts({
      productId: product.id,
      categoryId: product.category.id,
      vendorId: product.vendor.id,
    }),
    loadFrequentlyBoughtTogether({ productId: product.id }),
  ]);

  const ratings = product.vendor.reviews.map((review) => review.overall);
  const avgRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10
      : null;

  const deliveryDate = addDays(new Date(), product.leadTimeDays);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    gtin: product.gtin,
    description: product.description,
    richDescription: product.richDescription,
    basePrice: decimalToNumber(product.basePrice),
    currency: product.currency,
    priceUnit: product.priceUnit,
    moq: product.moq,
    orderIncrement: product.orderIncrement,
    stockQty: product.stockQty,
    allowBackorder: product.allowBackorder,
    leadTimeDays: product.leadTimeDays,
    certifications: product.certifications,
    attributes: parseAttributes(product.attributes),
    tags: product.tags,
    media: parseMedia(product.media),
    documents: product.documents,
    volumePricing: product.volumePricing.map((row) => ({
      minQuantity: row.minQuantity,
      price: decimalToNumber(row.price),
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      price: variant.price != null ? decimalToNumber(variant.price) : null,
      stockQty: variant.stockQty,
      attributes: parseAttributes(variant.attributes),
    })),
    categoryName: product.category.name,
    vendor: {
      id: product.vendor.id,
      companyName: product.vendor.companyName,
      type: product.vendor.type,
      avgRating,
      reviewCount: product.vendor.reviews.length,
    },
    expectedDeliveryLabel: format(deliveryDate, "EEE, MMM d, yyyy"),
    similarProducts: similarProducts.map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      basePrice: item.basePrice,
      currency: item.currency,
      vendorName: item.vendorName,
    })),
    boughtTogether: boughtTogether.map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      basePrice: item.basePrice,
      currency: item.currency,
      vendorName: item.vendorName,
    })),
    reviews: product.vendor.reviews.map((review) => ({
      id: review.id,
      overall: review.overall,
      qualityScore: review.qualityScore,
      accuracyScore: review.accuracyScore,
      deliveryScore: review.deliveryScore,
      packagingScore: review.packagingScore,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
    })),
  };
}

export function resolveUnitPrice(
  product: Pick<MarketplaceProductDetail, "basePrice" | "volumePricing">,
  quantity: number,
  variantPrice: number | null,
): number {
  if (variantPrice != null) return variantPrice;
  let price = product.basePrice;
  for (const tier of product.volumePricing) {
    if (quantity >= tier.minQuantity) price = tier.price;
  }
  return price;
}
