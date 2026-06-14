import type { Prisma } from "@prisma/client";
import type { MarketplaceProductStatus } from "@prisma/client";

import type { PlatformProductAdminFilters } from "@/lib/platform/marketplace-product-admin-filters";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/services/audit/audit-service";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";

export type ProductModerationNote = {
  at: string;
  by: string;
  action: string;
  note?: string;
};

export type ProductModerationMeta = {
  flagged?: boolean;
  flagReason?: string;
  changesRequested?: string;
  notes?: ProductModerationNote[];
};

export type PlatformProductListItem = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  status: MarketplaceProductStatus;
  basePrice: number;
  currency: string;
  stockQty: number;
  vendorId: string;
  vendorName: string;
  categoryName: string;
  flagged: boolean;
  flagReason: string | null;
  updatedAt: string;
  createdAt: string;
};

export type PlatformProductDetail = PlatformProductListItem & {
  gtin: string | null;
  description: string;
  moq: number;
  leadTimeDays: number;
  certifications: string[];
  moderation: ProductModerationMeta;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function parseAttributes(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw == null || Array.isArray(raw)) return {};
  return raw as Record<string, unknown>;
}

export function extractProductModerationMeta(attributes: unknown): ProductModerationMeta {
  const root = parseAttributes(attributes);
  const moderation = parseAttributes(root.moderation);
  const notesRaw = moderation.notes;
  const notes = Array.isArray(notesRaw)
    ? notesRaw.filter((entry): entry is ProductModerationNote => {
        return typeof entry === "object" && entry != null && typeof (entry as ProductModerationNote).at === "string";
      })
    : [];

  return {
    flagged: moderation.flagged === true,
    flagReason: typeof moderation.flagReason === "string" ? moderation.flagReason : undefined,
    changesRequested:
      typeof moderation.changesRequested === "string" ? moderation.changesRequested : undefined,
    notes,
  };
}

function mergeModerationMeta(
  attributes: unknown,
  patch: Partial<ProductModerationMeta> & { appendNote?: ProductModerationNote },
): Prisma.InputJsonValue {
  const root = parseAttributes(attributes);
  const current = extractProductModerationMeta(attributes);
  const notes = [...(current.notes ?? [])];
  if (patch.appendNote) notes.push(patch.appendNote);

  const moderation: ProductModerationMeta = {
    ...current,
    ...patch,
    notes,
  };
  delete (moderation as Partial<ProductModerationMeta> & { appendNote?: ProductModerationNote }).appendNote;

  return {
    ...root,
    moderation,
  } as Prisma.InputJsonValue;
}

function buildProductWhere(filters: PlatformProductAdminFilters): Prisma.VendorProductWhereInput {
  const where: Prisma.VendorProductWhereInput = {};

  if (filters.tab === "queue") {
    where.status = filters.status ?? "PENDING_REVIEW";
  } else if (filters.tab === "flagged") {
    where.attributes = {
      path: ["moderation", "flagged"],
      equals: true,
    };
    if (filters.status) where.status = filters.status;
  } else if (filters.status) {
    where.status = filters.status;
  }

  if (filters.categoryId) where.categoryId = filters.categoryId;

  if (filters.q) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { gtin: { contains: q, mode: "insensitive" } },
      { vendor: { companyName: { contains: q, mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function loadPlatformProducts(filters: PlatformProductAdminFilters): Promise<{
  items: PlatformProductListItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const where = buildProductWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [rows, total] = await Promise.all([
    prisma.vendorProduct.findMany({
      where,
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      skip,
      take: filters.pageSize,
      include: {
        vendor: { select: { id: true, companyName: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.vendorProduct.count({ where }),
  ]);

  return {
    items: rows.map((row) => {
      const moderation = extractProductModerationMeta(row.attributes);
      return {
        id: row.id,
        name: row.name,
        sku: row.sku,
        slug: row.slug,
        status: row.status,
        basePrice: decimalToNumber(row.basePrice),
        currency: row.currency,
        stockQty: row.stockQty,
        vendorId: row.vendor.id,
        vendorName: row.vendor.companyName,
        categoryName: row.category.name,
        flagged: moderation.flagged === true,
        flagReason: moderation.flagReason ?? null,
        updatedAt: row.updatedAt.toISOString(),
        createdAt: row.createdAt.toISOString(),
      };
    }),
    total,
    page: filters.page,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

export async function loadPlatformProductDetail(productId: string): Promise<PlatformProductDetail | null> {
  const product = await prisma.vendorProduct.findUnique({
    where: { id: productId },
    include: {
      vendor: { select: { id: true, companyName: true } },
      category: { select: { name: true } },
    },
  });
  if (!product) return null;

  const moderation = extractProductModerationMeta(product.attributes);

  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    slug: product.slug,
    status: product.status,
    basePrice: decimalToNumber(product.basePrice),
    currency: product.currency,
    stockQty: product.stockQty,
    vendorId: product.vendor.id,
    vendorName: product.vendor.companyName,
    categoryName: product.category.name,
    flagged: moderation.flagged === true,
    flagReason: moderation.flagReason ?? null,
    updatedAt: product.updatedAt.toISOString(),
    createdAt: product.createdAt.toISOString(),
    gtin: product.gtin,
    description: product.description,
    moq: product.moq,
    leadTimeDays: product.leadTimeDays,
    certifications: product.certifications,
    moderation,
  };
}

export async function loadPlatformProductCategories() {
  return prisma.marketplaceProductCategory.findMany({
    where: { level: 2 },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
}

async function appendModerationAudit(input: {
  vendorId: string;
  productId: string;
  productName: string;
  reviewerUserId: string;
  reviewerEmail: string | null;
  action: string;
  status: MarketplaceProductStatus;
}) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: input.vendorId },
    select: { workspaceId: true },
  });
  if (!vendor?.workspaceId) return;

  await auditLog({
    workspaceId: vendor.workspaceId,
    actor: {
      userId: input.reviewerUserId,
      email: input.reviewerEmail,
      role: "PLATFORM",
    },
    action: AUDIT_ACTIONS.SETTINGS_UPDATED,
    category: "OTHER",
    source: "USER",
    severity: input.action === "reject" ? "WARNING" : "INFO",
    entity: { type: "MarketplaceProduct", id: input.productId, label: input.productName },
    metadata: {
      operation: `marketplace.product.${input.action}`,
      productId: input.productId,
      status: input.status,
    },
  });
}

export async function moderatePlatformProduct(input: {
  productId: string;
  action: "approve" | "reject" | "request_changes" | "flag" | "unflag";
  reviewerUserId: string;
  reviewerEmail: string | null;
  notes?: string | null;
  flagReason?: string | null;
}): Promise<{ ok: true; status: MarketplaceProductStatus } | { ok: false; error: string }> {
  const product = await prisma.vendorProduct.findUnique({
    where: { id: input.productId },
    select: {
      id: true,
      name: true,
      status: true,
      vendorId: true,
      attributes: true,
    },
  });
  if (!product) return { ok: false, error: "Product not found." };

  const noteEntry: ProductModerationNote = {
    at: new Date().toISOString(),
    by: input.reviewerEmail ?? input.reviewerUserId,
    action: input.action,
    note: input.notes?.trim() || undefined,
  };

  if (input.action === "approve") {
    if (!["PENDING_REVIEW", "DRAFT", "OUT_OF_STOCK"].includes(product.status)) {
      return { ok: false, error: "Product is not eligible for approval." };
    }
    const status: MarketplaceProductStatus = "ACTIVE";
    await prisma.vendorProduct.update({
      where: { id: product.id },
      data: {
        status,
        attributes: mergeModerationMeta(product.attributes, {
          flagged: false,
          flagReason: undefined,
          changesRequested: undefined,
          appendNote: noteEntry,
        }),
      },
    });
    await appendModerationAudit({ ...input, vendorId: product.vendorId, productName: product.name, status, action: "approve" });
    return { ok: true, status };
  }

  if (input.action === "reject") {
    const status: MarketplaceProductStatus = "ARCHIVED";
    await prisma.vendorProduct.update({
      where: { id: product.id },
      data: {
        status,
        attributes: mergeModerationMeta(product.attributes, {
          appendNote: noteEntry,
        }),
      },
    });
    await appendModerationAudit({ ...input, vendorId: product.vendorId, productName: product.name, status, action: "reject" });
    return { ok: true, status };
  }

  if (input.action === "request_changes") {
    const status: MarketplaceProductStatus = "DRAFT";
    await prisma.vendorProduct.update({
      where: { id: product.id },
      data: {
        status,
        attributes: mergeModerationMeta(product.attributes, {
          changesRequested: input.notes?.trim() || "Changes requested by marketplace admin.",
          appendNote: noteEntry,
        }),
      },
    });
    await appendModerationAudit({
      ...input,
      vendorId: product.vendorId,
      productName: product.name,
      status,
      action: "request_changes",
    });
    return { ok: true, status };
  }

  if (input.action === "flag") {
    await prisma.vendorProduct.update({
      where: { id: product.id },
      data: {
        attributes: mergeModerationMeta(product.attributes, {
          flagged: true,
          flagReason: input.flagReason?.trim() || input.notes?.trim() || "Flagged by marketplace admin.",
          appendNote: noteEntry,
        }),
      },
    });
    return { ok: true, status: product.status };
  }

  if (input.action === "unflag") {
    await prisma.vendorProduct.update({
      where: { id: product.id },
      data: {
        attributes: mergeModerationMeta(product.attributes, {
          flagged: false,
          flagReason: undefined,
          appendNote: noteEntry,
        }),
      },
    });
    return { ok: true, status: product.status };
  }

  return { ok: false, error: "Unsupported moderation action." };
}

export async function bulkModeratePlatformProducts(input: {
  productIds: string[];
  action: "approve" | "reject" | "flag";
  reviewerUserId: string;
  reviewerEmail: string | null;
  notes?: string | null;
}): Promise<{ ok: true; updated: number } | { ok: false; error: string }> {
  if (input.productIds.length === 0) return { ok: false, error: "No products selected." };

  let updated = 0;
  for (const productId of input.productIds) {
    const result = await moderatePlatformProduct({
      productId,
      action: input.action,
      reviewerUserId: input.reviewerUserId,
      reviewerEmail: input.reviewerEmail,
      notes: input.notes,
      flagReason: input.notes,
    });
    if (result.ok) updated += 1;
  }

  return { ok: true, updated };
}

export async function countPlatformProductQueue(): Promise<number> {
  return prisma.vendorProduct.count({ where: { status: "PENDING_REVIEW" } });
}

export async function countFlaggedPlatformProducts(): Promise<number> {
  return prisma.vendorProduct.count({
    where: {
      attributes: {
        path: ["moderation", "flagged"],
        equals: true,
      },
    },
  });
}
