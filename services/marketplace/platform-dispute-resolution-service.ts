import type { Prisma } from "@prisma/client";
import type { MarketplaceDisputeReason, MarketplaceDisputeStatus } from "@prisma/client";

import {
  parseDisputeResolution,
  serializeDisputeResolution,
  type DisputeResolutionDecision,
  type DisputeResolutionEntry,
  type StoredDisputeResolution,
} from "@/lib/marketplace/dispute-types";
import type { PlatformDisputeAdminFilters } from "@/lib/platform/marketplace-dispute-admin-filters";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/services/audit/audit-service";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { moderatePlatformVendor } from "@/services/marketplace/platform-vendor-moderation-service";
import { releaseFunds } from "@/services/marketplace/stripe-connect-service";

export type PlatformDisputeListItem = {
  id: string;
  status: MarketplaceDisputeStatus;
  reason: MarketplaceDisputeReason;
  description: string;
  photoCount: number;
  purchaseOrderId: string;
  poNumber: string | null;
  orderTotal: number;
  currency: string;
  vendorId: string;
  vendorName: string;
  buyerName: string;
  openedAt: string;
  resolvedAt: string | null;
};

export type PlatformDisputeDetail = PlatformDisputeListItem & {
  photos: string[];
  orderStatus: string;
  paymentIntentId: string | null;
  lineItems: Array<{
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
  }>;
  messages: Array<{
    id: string;
    senderType: string;
    body: string;
    attachments: string[];
    createdAt: string;
  }>;
  resolution: StoredDisputeResolution | null;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function buildDisputeWhere(filters: PlatformDisputeAdminFilters): Prisma.MarketplaceDisputeWhereInput {
  const where: Prisma.MarketplaceDisputeWhereInput = {};

  if (filters.status) where.status = filters.status;
  if (filters.reason) where.reason = filters.reason;

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (filters.q) {
    const q = filters.q.trim();
    where.OR = [
      { description: { contains: q, mode: "insensitive" } },
      { purchaseOrder: { poNumber: { contains: q, mode: "insensitive" } } },
      { purchaseOrder: { vendor: { companyName: { contains: q, mode: "insensitive" } } } },
      { purchaseOrder: { workspace: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  return where;
}

function mapDisputeRow(row: {
  id: string;
  status: MarketplaceDisputeStatus;
  reason: MarketplaceDisputeReason;
  description: string;
  photos: string[];
  purchaseOrderId: string;
  createdAt: Date;
  resolvedAt: Date | null;
  purchaseOrder: {
    poNumber: string | null;
    total: { toString(): string };
    currency: string;
    vendorId: string;
    vendor: { id: string; companyName: string };
    workspace: { name: string };
  };
}): PlatformDisputeListItem {
  return {
    id: row.id,
    status: row.status,
    reason: row.reason,
    description: row.description,
    photoCount: row.photos.length,
    purchaseOrderId: row.purchaseOrderId,
    poNumber: row.purchaseOrder.poNumber,
    orderTotal: decimalToNumber(row.purchaseOrder.total),
    currency: row.purchaseOrder.currency,
    vendorId: row.purchaseOrder.vendorId,
    vendorName: row.purchaseOrder.vendor.companyName,
    buyerName: row.purchaseOrder.workspace.name,
    openedAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
  };
}

export async function loadPlatformDisputes(filters: PlatformDisputeAdminFilters): Promise<{
  items: PlatformDisputeListItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const where = buildDisputeWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [rows, total] = await Promise.all([
    prisma.marketplaceDispute.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: filters.pageSize,
      include: {
        purchaseOrder: {
          select: {
            poNumber: true,
            total: true,
            currency: true,
            vendorId: true,
            vendor: { select: { id: true, companyName: true } },
            workspace: { select: { name: true } },
          },
        },
      },
    }),
    prisma.marketplaceDispute.count({ where }),
  ]);

  return {
    items: rows.map(mapDisputeRow),
    total,
    page: filters.page,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

export async function loadPlatformDisputeDetail(disputeId: string): Promise<PlatformDisputeDetail | null> {
  const dispute = await prisma.marketplaceDispute.findUnique({
    where: { id: disputeId },
    include: {
      purchaseOrder: {
        select: {
          poNumber: true,
          total: true,
          currency: true,
          vendorId: true,
          status: true,
          paymentIntentId: true,
          vendor: { select: { id: true, companyName: true } },
          workspace: { select: { name: true } },
          items: {
            select: {
              productName: true,
              sku: true,
              quantity: true,
              unitPrice: true,
            },
          },
        },
      },
    },
  });
  if (!dispute) return null;

  const messages = await prisma.vendorMessage.findMany({
    where: { purchaseOrderId: dispute.purchaseOrderId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      senderType: true,
      message: true,
      attachments: true,
      createdAt: true,
    },
  });

  const base = mapDisputeRow({
    ...dispute,
    purchaseOrder: dispute.purchaseOrder,
  });

  return {
    ...base,
    photos: dispute.photos,
    orderStatus: dispute.purchaseOrder.status,
    paymentIntentId: dispute.purchaseOrder.paymentIntentId,
    lineItems: dispute.purchaseOrder.items.map((item) => ({
      productName: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: decimalToNumber(item.unitPrice),
    })),
    messages: messages.map((message) => ({
      id: message.id,
      senderType: message.senderType,
      body: message.message,
      attachments: message.attachments,
      createdAt: message.createdAt.toISOString(),
    })),
    resolution: parseDisputeResolution(dispute.resolution),
  };
}

export async function countOpenPlatformDisputes(): Promise<number> {
  return prisma.marketplaceDispute.count({
    where: { status: { in: ["OPEN", "VENDOR_RESPONSE", "ADMIN_REVIEW"] } },
  });
}

async function autoFlagVendorForDisputes(input: {
  vendorId: string;
  reviewerUserId: string;
  reviewerEmail: string | null;
  decision: DisputeResolutionDecision;
}) {
  if (input.decision === "pay_vendor") return;

  const recentLossCount = await prisma.marketplaceDispute.count({
    where: {
      status: "RESOLVED",
      purchaseOrder: { vendorId: input.vendorId },
      createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
  });

  if (recentLossCount >= 2) {
    await moderatePlatformVendor({
      vendorId: input.vendorId,
      action: "flag",
      reviewerUserId: input.reviewerUserId,
      reviewerEmail: input.reviewerEmail,
      notes: `Auto-flagged after ${recentLossCount} resolved disputes in 90 days.`,
    });
  }
}

function amountsForDecision(
  decision: DisputeResolutionDecision,
  orderTotal: number,
  splitBuyerAmount?: number,
): { buyerAmount: number; vendorAmount: number } {
  if (decision === "refund") {
    return { buyerAmount: orderTotal, vendorAmount: 0 };
  }
  if (decision === "pay_vendor") {
    return { buyerAmount: 0, vendorAmount: orderTotal };
  }
  const buyerAmount = Math.max(0, Math.min(orderTotal, splitBuyerAmount ?? orderTotal / 2));
  const vendorAmount = Math.max(0, orderTotal - buyerAmount);
  return { buyerAmount, vendorAmount };
}

export async function resolvePlatformDispute(input: {
  disputeId: string;
  decision: DisputeResolutionDecision;
  notes: string;
  splitBuyerAmount?: number;
  reviewerUserId: string;
  reviewerEmail: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const dispute = await prisma.marketplaceDispute.findUnique({
    where: { id: input.disputeId },
    include: {
      purchaseOrder: {
        select: {
          id: true,
          workspaceId: true,
          vendorId: true,
          total: true,
          paymentIntentId: true,
          poNumber: true,
        },
      },
    },
  });
  if (!dispute) return { ok: false, error: "Dispute not found." };
  if (dispute.status === "RESOLVED") {
    return { ok: false, error: "Dispute is already resolved." };
  }

  const orderTotal = decimalToNumber(dispute.purchaseOrder.total);
  const { buyerAmount, vendorAmount } = amountsForDecision(
    input.decision,
    orderTotal,
    input.splitBuyerAmount,
  );

  const entry: DisputeResolutionEntry = {
    decision: input.decision,
    buyerAmount,
    vendorAmount,
    notes: input.notes.trim(),
    resolvedById: input.reviewerUserId,
    resolvedByEmail: input.reviewerEmail,
    resolvedAt: new Date().toISOString(),
  };

  const resolution = serializeDisputeResolution(dispute.resolution, entry);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.marketplaceDispute.update({
      where: { id: dispute.id },
      data: {
        status: "RESOLVED",
        resolution,
        resolvedById: input.reviewerUserId,
        resolvedAt: now,
      },
    });

    await tx.marketplacePurchaseOrder.update({
      where: { id: dispute.purchaseOrder.id },
      data: { status: "COMPLETED" },
    });

    const transaction = await tx.vendorTransaction.findUnique({
      where: { purchaseOrderId: dispute.purchaseOrder.id },
    });
    if (transaction) {
      await tx.vendorTransaction.update({
        where: { id: transaction.id },
        data: {
          status: input.decision === "refund" ? "PENDING" : "AVAILABLE",
          netAmount: vendorAmount,
        },
      });
    }
  });

  if (input.decision === "pay_vendor" && dispute.purchaseOrder.paymentIntentId) {
    await releaseFunds(dispute.purchaseOrder.paymentIntentId);
  }

  await autoFlagVendorForDisputes({
    vendorId: dispute.purchaseOrder.vendorId,
    reviewerUserId: input.reviewerUserId,
    reviewerEmail: input.reviewerEmail,
    decision: input.decision,
  });

  await auditLog({
    workspaceId: dispute.purchaseOrder.workspaceId,
    actor: {
      userId: input.reviewerUserId,
      email: input.reviewerEmail,
      role: "PLATFORM",
    },
    action: AUDIT_ACTIONS.SETTINGS_UPDATED,
    category: "OTHER",
    source: "USER",
    severity: input.decision === "refund" ? "WARNING" : "INFO",
    entity: {
      type: "MarketplaceDispute",
      id: dispute.id,
      label: dispute.purchaseOrder.poNumber ?? dispute.purchaseOrder.id,
    },
    metadata: {
      operation: `marketplace.dispute.${input.decision}`,
      disputeId: dispute.id,
      buyerAmount,
      vendorAmount,
    },
  });

  return { ok: true };
}

export async function escalatePlatformDisputeToAdminReview(disputeId: string): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const dispute = await prisma.marketplaceDispute.findUnique({
    where: { id: disputeId },
    select: { id: true, status: true },
  });
  if (!dispute) return { ok: false, error: "Dispute not found." };
  if (dispute.status === "RESOLVED") {
    return { ok: false, error: "Resolved disputes cannot be escalated." };
  }

  await prisma.marketplaceDispute.update({
    where: { id: disputeId },
    data: { status: "ADMIN_REVIEW" },
  });

  return { ok: true };
}
