import type { Prisma, VendorPlanTier, VendorStatus, VendorType } from "@prisma/client";

import {
  extractRegistrationMeta,
  parseVendorDocuments,
  type VendorRegistrationSummary,
} from "@/lib/marketplace/vendor-registration-types";
import type { PlatformVendorAdminFilters } from "@/lib/platform/marketplace-vendor-admin-filters";
import { prisma } from "@/lib/prisma";
import { reviewVendorRegistration } from "@/services/marketplace/vendor-registration-service";

export type PlatformVendorListItem = {
  id: string;
  companyName: string;
  legalName: string;
  type: VendorType;
  status: VendorStatus;
  planTier: VendorPlanTier;
  commissionRate: number;
  workspaceName: string | null;
  productCount: number;
  orderCount: number;
  revenue: number;
  disputeCount: number;
  avgRating: number | null;
  verifiedAt: string | null;
  createdAt: string;
};

export type PlatformVendorDetail = VendorRegistrationSummary & {
  planTier: VendorPlanTier;
  commissionRate: number;
  stripeAccountId: string | null;
  workspaceName: string | null;
  productCount: number;
  orderCount: number;
  revenue: number;
  disputeCount: number;
  avgRating: number | null;
  recentOrders: Array<{
    id: string;
    poNumber: string | null;
    status: string;
    total: number;
    currency: string;
    buyerName: string;
    createdAt: string;
  }>;
  disputes: Array<{
    id: string;
    status: string;
    reason: string;
    purchaseOrderId: string;
    createdAt: string;
  }>;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function buildVendorWhere(filters: PlatformVendorAdminFilters) {
  const where: Prisma.VendorWhereInput = {};

  if (filters.tab === "queue") {
    where.status = filters.status
      ? filters.status
      : { in: ["PENDING", "UNDER_REVIEW"] };
  } else if (filters.status) {
    where.status = filters.status;
  }

  if (filters.type) where.type = filters.type;
  if (filters.plan) where.planTier = filters.plan;

  if (filters.q) {
    const q = filters.q.trim();
    where.OR = [
      { companyName: { contains: q, mode: "insensitive" } },
      { legalName: { contains: q, mode: "insensitive" } },
      { workspace: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function loadPlatformVendors(filters: PlatformVendorAdminFilters): Promise<{
  items: PlatformVendorListItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const where = buildVendorWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [rows, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: filters.pageSize,
      include: {
        workspace: { select: { name: true } },
        _count: { select: { products: true, orders: true, reviews: true } },
      },
    }),
    prisma.vendor.count({ where }),
  ]);

  const vendorIds = rows.map((row) => row.id);
  const [revenueAgg, ratingAgg, disputeAgg] = await Promise.all([
    prisma.vendorTransaction.groupBy({
      by: ["vendorId"],
      where: { vendorId: { in: vendorIds } },
      _sum: { grossAmount: true },
    }),
    prisma.marketplaceVendorReview.groupBy({
      by: ["vendorId"],
      where: { vendorId: { in: vendorIds } },
      _avg: { overall: true },
    }),
    prisma.marketplaceDispute.findMany({
      where: { purchaseOrder: { vendorId: { in: vendorIds } } },
      select: { purchaseOrder: { select: { vendorId: true } } },
    }),
  ]);

  const revenueByVendor = new Map(revenueAgg.map((row) => [row.vendorId, decimalToNumber(row._sum.grossAmount)]));
  const ratingByVendor = new Map(
    ratingAgg.map((row) => [
      row.vendorId,
      row._avg.overall != null ? Math.round(Number(row._avg.overall) * 10) / 10 : null,
    ]),
  );
  const disputesByVendor = new Map<string, number>();
  for (const row of disputeAgg) {
    const vendorId = row.purchaseOrder.vendorId;
    disputesByVendor.set(vendorId, (disputesByVendor.get(vendorId) ?? 0) + 1);
  }

  return {
    items: rows.map((row) => ({
      id: row.id,
      companyName: row.companyName,
      legalName: row.legalName,
      type: row.type,
      status: row.status,
      planTier: row.planTier,
      commissionRate: decimalToNumber(row.commissionRate),
      workspaceName: row.workspace?.name ?? null,
      productCount: row._count.products,
      orderCount: row._count.orders,
      revenue: revenueByVendor.get(row.id) ?? 0,
      disputeCount: disputesByVendor.get(row.id) ?? 0,
      avgRating: ratingByVendor.get(row.id) ?? null,
      verifiedAt: row.verifiedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
    total,
    page: filters.page,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

export async function loadPlatformVendorDetail(vendorId: string): Promise<PlatformVendorDetail | null> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      workspace: { select: { name: true } },
      _count: { select: { products: true, orders: true } },
    },
  });
  if (!vendor) return null;

  const documents = parseVendorDocuments(vendor.documents);
  const meta = extractRegistrationMeta(documents);

  const [revenueAgg, ratingAgg, disputeCount, recentOrders, disputes] = await Promise.all([
    prisma.vendorTransaction.aggregate({
      where: { vendorId },
      _sum: { grossAmount: true },
    }),
    prisma.marketplaceVendorReview.aggregate({
      where: { vendorId },
      _avg: { overall: true },
    }),
    prisma.marketplaceDispute.count({ where: { purchaseOrder: { vendorId } } }),
    prisma.marketplacePurchaseOrder.findMany({
      where: { vendorId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        poNumber: true,
        status: true,
        total: true,
        currency: true,
        createdAt: true,
        workspace: { select: { name: true } },
      },
    }),
    prisma.marketplaceDispute.findMany({
      where: { purchaseOrder: { vendorId } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        reason: true,
        purchaseOrderId: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    vendorId: vendor.id,
    companyName: vendor.companyName,
    legalName: vendor.legalName,
    type: vendor.type,
    status: vendor.status,
    documents,
    verifiedAt: vendor.verifiedAt?.toISOString() ?? null,
    createdAt: vendor.createdAt.toISOString(),
    updatedAt: vendor.updatedAt.toISOString(),
    ...meta,
    planTier: vendor.planTier,
    commissionRate: decimalToNumber(vendor.commissionRate),
    stripeAccountId: vendor.stripeAccountId,
    workspaceName: vendor.workspace?.name ?? null,
    productCount: vendor._count.products,
    orderCount: vendor._count.orders,
    revenue: decimalToNumber(revenueAgg._sum.grossAmount),
    disputeCount,
    avgRating:
      ratingAgg._avg.overall != null ? Math.round(Number(ratingAgg._avg.overall) * 10) / 10 : null,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      poNumber: order.poNumber,
      status: order.status,
      total: decimalToNumber(order.total),
      currency: order.currency,
      buyerName: order.workspace.name,
      createdAt: order.createdAt.toISOString(),
    })),
    disputes: disputes.map((dispute) => ({
      id: dispute.id,
      status: dispute.status,
      reason: dispute.reason,
      purchaseOrderId: dispute.purchaseOrderId,
      createdAt: dispute.createdAt.toISOString(),
    })),
  };
}

export async function moderatePlatformVendor(input: {
  vendorId: string;
  action: "approve" | "reject" | "suspend" | "reactivate" | "review";
  reviewerUserId: string;
  reviewerEmail: string | null;
  notes?: string | null;
}): Promise<{ ok: true; status: VendorStatus } | { ok: false; error: string }> {
  if (input.action === "approve" || input.action === "reject" || input.action === "review") {
    return reviewVendorRegistration({
      vendorId: input.vendorId,
      decision: input.action,
      reviewerUserId: input.reviewerUserId,
      reviewerEmail: input.reviewerEmail,
      notes: input.notes,
    });
  }

  if (input.action === "suspend" || input.action === "reactivate") {
    const vendor = await prisma.vendor.findUnique({
      where: { id: input.vendorId },
      select: { id: true, status: true, documents: true },
    });
    if (!vendor) return { ok: false, error: "Vendor not found." };

    if (input.action === "suspend" && vendor.status !== "APPROVED") {
      return { ok: false, error: "Only approved vendors can be suspended." };
    }
    if (input.action === "reactivate" && vendor.status !== "SUSPENDED") {
      return { ok: false, error: "Only suspended vendors can be reactivated." };
    }

    const status: VendorStatus = input.action === "suspend" ? "SUSPENDED" : "APPROVED";
    const documents = parseVendorDocuments(vendor.documents);
    if (input.notes?.trim()) {
      documents.push({
        kind: "review",
        note: `[${input.action}] ${input.notes.trim()}`,
        uploadedAt: new Date().toISOString(),
      });
    }

    await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        status,
        verifiedAt: status === "APPROVED" ? new Date() : undefined,
        documents: documents as Prisma.InputJsonValue,
      },
    });

    return { ok: true, status };
  }

  return { ok: false, error: "Unsupported moderation action." };
}

export async function bulkModeratePlatformVendors(input: {
  vendorIds: string[];
  action: "approve" | "suspend";
  reviewerUserId: string;
  reviewerEmail: string | null;
}): Promise<{ ok: true; updated: number } | { ok: false; error: string }> {
  if (input.vendorIds.length === 0) return { ok: false, error: "No vendors selected." };

  let updated = 0;
  for (const vendorId of input.vendorIds) {
    const result = await moderatePlatformVendor({
      vendorId,
      action: input.action,
      reviewerUserId: input.reviewerUserId,
      reviewerEmail: input.reviewerEmail,
    });
    if (result.ok) updated += 1;
  }

  return { ok: true, updated };
}
