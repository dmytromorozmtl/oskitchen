import type { MarketplaceTransactionStatus } from "@prisma/client";
import { endOfDay, format, startOfDay, subDays } from "date-fns";

import type { VendorFinanceFilters } from "@/lib/marketplace/vendor-finance-filters";
import { prisma } from "@/lib/prisma";

export type VendorFinanceTrendPoint = {
  label: string;
  gross: number;
  commission: number;
  net: number;
};

export type VendorTransactionRow = {
  id: string;
  purchaseOrderId: string;
  poNumber: string | null;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  status: MarketplaceTransactionStatus;
  payoutId: string | null;
  availableAt: string | null;
  createdAt: string;
};

export type VendorPayoutRow = {
  payoutId: string;
  amount: number;
  transactionCount: number;
  paidAt: string;
};

export type VendorFinanceModel = {
  currency: string;
  commissionRate: number;
  balanceAvailable: number;
  balancePending: number;
  balancePaidOut: number;
  revenueTrend: VendorFinanceTrendPoint[];
  transactions: VendorTransactionRow[];
  totalTransactions: number;
  page: number;
  totalPages: number;
  payoutHistory: VendorPayoutRow[];
  taxYearGross: number;
  taxYearNet: number;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

async function syncAvailableVendorTransactions(vendorId: string) {
  const eligible = await prisma.vendorTransaction.findMany({
    where: {
      vendorId,
      status: "PENDING",
      purchaseOrder: { status: { in: ["SHIPPED", "DELIVERED", "COMPLETED"] } },
    },
    select: { id: true },
  });

  if (eligible.length === 0) return;

  await prisma.vendorTransaction.updateMany({
    where: { id: { in: eligible.map((row) => row.id) } },
    data: { status: "AVAILABLE", availableAt: new Date() },
  });
}

function buildTransactionWhere(vendorId: string, filters: VendorFinanceFilters) {
  const where: Parameters<typeof prisma.vendorTransaction.findMany>[0]["where"] = { vendorId };

  if (filters.status) where.status = filters.status;

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = startOfDay(new Date(filters.dateFrom));
    if (filters.dateTo) where.createdAt.lte = endOfDay(new Date(filters.dateTo));
  }

  if (filters.q) {
    const q = filters.q.trim();
    where.purchaseOrder = {
      OR: [
        { poNumber: { contains: q, mode: "insensitive" } },
        { workspace: { name: { contains: q, mode: "insensitive" } } },
      ],
    };
  }

  return where;
}

export async function loadVendorFinance(
  vendorId: string,
  filters: VendorFinanceFilters,
): Promise<VendorFinanceModel> {
  await syncAvailableVendorTransactions(vendorId);

  const trendStart = startOfDay(subDays(new Date(), 29));
  const taxYearStart = startOfDay(new Date(new Date().getFullYear(), 0, 1));

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { commissionRate: true },
  });

  const where = buildTransactionWhere(vendorId, filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [
    availableAgg,
    pendingAgg,
    paidOutAgg,
    trendRows,
    transactions,
    totalTransactions,
    payoutGroups,
    taxYearAgg,
  ] = await Promise.all([
    prisma.vendorTransaction.aggregate({
      where: { vendorId, status: "AVAILABLE" },
      _sum: { netAmount: true },
    }),
    prisma.vendorTransaction.aggregate({
      where: { vendorId, status: "PENDING" },
      _sum: { netAmount: true },
    }),
    prisma.vendorTransaction.aggregate({
      where: { vendorId, status: "PAID_OUT" },
      _sum: { netAmount: true },
    }),
    prisma.vendorTransaction.findMany({
      where: { vendorId, createdAt: { gte: trendStart } },
      select: {
        createdAt: true,
        grossAmount: true,
        commissionAmount: true,
        netAmount: true,
      },
    }),
    prisma.vendorTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: filters.pageSize,
      include: {
        purchaseOrder: { select: { poNumber: true } },
      },
    }),
    prisma.vendorTransaction.count({ where }),
    prisma.vendorTransaction.groupBy({
      by: ["payoutId"],
      where: { vendorId, status: "PAID_OUT", payoutId: { not: null } },
      _sum: { netAmount: true },
      _count: { _all: true },
      _max: { updatedAt: true },
      orderBy: { _max: { updatedAt: "desc" } },
      take: 10,
    }),
    prisma.vendorTransaction.aggregate({
      where: { vendorId, createdAt: { gte: taxYearStart } },
      _sum: { grossAmount: true, netAmount: true },
    }),
  ]);

  const trendBuckets = new Map<string, { gross: number; commission: number; net: number }>();
  for (let i = 29; i >= 0; i -= 1) {
    const key = format(subDays(new Date(), i), "yyyy-MM-dd");
    trendBuckets.set(key, { gross: 0, commission: 0, net: 0 });
  }
  for (const row of trendRows) {
    const key = format(row.createdAt, "yyyy-MM-dd");
    const bucket = trendBuckets.get(key);
    if (!bucket) continue;
    bucket.gross += decimalToNumber(row.grossAmount);
    bucket.commission += decimalToNumber(row.commissionAmount);
    bucket.net += decimalToNumber(row.netAmount);
  }

  const revenueTrend = [...trendBuckets.entries()].map(([key, bucket]) => ({
    label: format(new Date(`${key}T12:00:00`), "MMM d"),
    gross: Math.round(bucket.gross * 100) / 100,
    commission: Math.round(bucket.commission * 100) / 100,
    net: Math.round(bucket.net * 100) / 100,
  }));

  return {
    currency: "USD",
    commissionRate: decimalToNumber(vendor?.commissionRate ?? 5),
    balanceAvailable: decimalToNumber(availableAgg._sum.netAmount),
    balancePending: decimalToNumber(pendingAgg._sum.netAmount),
    balancePaidOut: decimalToNumber(paidOutAgg._sum.netAmount),
    revenueTrend,
    transactions: transactions.map((row) => ({
      id: row.id,
      purchaseOrderId: row.purchaseOrderId,
      poNumber: row.purchaseOrder.poNumber,
      grossAmount: decimalToNumber(row.grossAmount),
      commissionAmount: decimalToNumber(row.commissionAmount),
      netAmount: decimalToNumber(row.netAmount),
      status: row.status,
      payoutId: row.payoutId,
      availableAt: row.availableAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
    totalTransactions,
    page: filters.page,
    totalPages: Math.max(1, Math.ceil(totalTransactions / filters.pageSize)),
    payoutHistory: payoutGroups
      .filter((group) => group.payoutId)
      .map((group) => ({
        payoutId: group.payoutId!,
        amount: decimalToNumber(group._sum.netAmount),
        transactionCount: group._count._all,
        paidAt: group._max.updatedAt?.toISOString() ?? new Date().toISOString(),
      })),
    taxYearGross: decimalToNumber(taxYearAgg._sum.grossAmount),
    taxYearNet: decimalToNumber(taxYearAgg._sum.netAmount),
  };
}

export async function requestVendorPayout(vendorId: string): Promise<
  | { ok: true; payoutId: string; amount: number; transactionCount: number }
  | { ok: false; error: string }
> {
  const available = await prisma.vendorTransaction.findMany({
    where: { vendorId, status: "AVAILABLE" },
    select: { id: true, netAmount: true },
  });

  if (available.length === 0) {
    return { ok: false, error: "No available balance to pay out." };
  }

  const payoutId = `PAYOUT-${Date.now().toString(36).toUpperCase()}`;
  const amount = available.reduce((sum, row) => sum + decimalToNumber(row.netAmount), 0);

  await prisma.vendorTransaction.updateMany({
    where: { id: { in: available.map((row) => row.id) } },
    data: { status: "PAID_OUT", payoutId },
  });

  return { ok: true, payoutId, amount, transactionCount: available.length };
}

export function buildVendor1099Html(input: {
  vendorName: string;
  legalName: string;
  taxYear: number;
  grossAmount: number;
  netAmount: number;
  commissionAmount: number;
  transactionCount: number;
}): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>1099-K summary ${input.taxYear}</title>
<style>body{font-family:system-ui,sans-serif;padding:2rem;color:#111;max-width:720px}table{width:100%;border-collapse:collapse;margin-top:1.5rem}th,td{border-bottom:1px solid #ddd;padding:.5rem;text-align:left}@media print{body{padding:0}}</style>
</head><body>
<h1>Marketplace payment summary (1099-K)</h1>
<p>Tax year ${input.taxYear}</p>
<p><strong>Vendor:</strong> ${escapeHtml(input.vendorName)}<br><strong>Legal name:</strong> ${escapeHtml(input.legalName)}</p>
<table>
<tr><th>Gross marketplace payments</th><td>$${input.grossAmount.toFixed(2)}</td></tr>
<tr><th>Platform commission</th><td>$${input.commissionAmount.toFixed(2)}</td></tr>
<tr><th>Net paid to vendor</th><td>$${input.netAmount.toFixed(2)}</td></tr>
<tr><th>Transactions</th><td>${input.transactionCount}</td></tr>
</table>
<p style="margin-top:2rem;font-size:12px;color:#666">Informational summary for tax preparation. Official 1099-K forms are issued separately when thresholds are met.</p>
</body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function loadVendor1099Summary(vendorId: string, taxYear: number) {
  const start = startOfDay(new Date(taxYear, 0, 1));
  const end = endOfDay(new Date(taxYear, 11, 31));

  const [vendor, agg, count] = await Promise.all([
    prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { companyName: true, legalName: true },
    }),
    prisma.vendorTransaction.aggregate({
      where: { vendorId, createdAt: { gte: start, lte: end } },
      _sum: { grossAmount: true, netAmount: true, commissionAmount: true },
    }),
    prisma.vendorTransaction.count({
      where: { vendorId, createdAt: { gte: start, lte: end } },
    }),
  ]);

  if (!vendor) return null;

  return {
    vendorName: vendor.companyName,
    legalName: vendor.legalName,
    taxYear,
    grossAmount: decimalToNumber(agg._sum.grossAmount),
    netAmount: decimalToNumber(agg._sum.netAmount),
    commissionAmount: decimalToNumber(agg._sum.commissionAmount),
    transactionCount: count,
  };
}
