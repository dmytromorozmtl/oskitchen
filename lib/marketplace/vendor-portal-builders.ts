import {
  VENDOR_PORTAL_BASE_PATH,
  VENDOR_PORTAL_POLICY_ID,
  type VendorPortalModuleId,
} from "@/lib/marketplace/vendor-portal-policy";
import type {
  VendorPortalAnalyticsHighlight,
  VendorPortalHub,
  VendorPortalInvoiceRow,
  VendorPortalModuleSnapshot,
  VendorPortalModuleStatus,
  VendorPortalRecentOrder,
} from "@/lib/marketplace/vendor-portal-types";

function moduleStatus(score: number): VendorPortalModuleStatus {
  if (score >= 2) return "critical";
  if (score >= 1) return "watch";
  if (score <= -1) return "idle";
  return "healthy";
}

export function buildVendorOrdersModule(input: {
  ordersActive: number;
  ordersPending: number;
  ordersMonth: number;
}): VendorPortalModuleSnapshot {
  const score = input.ordersPending >= 5 ? 2 : input.ordersPending > 0 ? 1 : input.ordersMonth === 0 ? -1 : 0;

  return {
    module: "orders",
    label: "Orders",
    status: moduleStatus(score),
    headline:
      input.ordersPending > 0
        ? `${input.ordersPending} order${input.ordersPending === 1 ? "" : "s"} need vendor action`
        : `${input.ordersActive} active marketplace orders`,
    metrics: [
      { label: "Active", value: input.ordersActive },
      { label: "Pending action", value: input.ordersPending },
      { label: "Last 30 days", value: input.ordersMonth },
    ],
    recommendation:
      input.ordersPending > 0
        ? "Confirm submitted POs and set delivery dates to keep buyer SLAs."
        : input.ordersMonth === 0
          ? "Publish active SKUs — orders appear once buyers checkout your catalog."
          : "Monitor processing and shipping statuses from the orders inbox.",
    href: `${VENDOR_PORTAL_BASE_PATH}/orders`,
  };
}

export function buildVendorInvoicesModule(input: {
  outstandingCount: number;
  outstandingAmount: number;
  paidOutCount: number;
  currency: string;
}): VendorPortalModuleSnapshot {
  const score =
    input.outstandingCount >= 8 ? 1 : input.outstandingCount === 0 && input.paidOutCount === 0 ? -1 : 0;

  return {
    module: "invoices",
    label: "Invoices",
    status: moduleStatus(score),
    headline:
      input.outstandingCount > 0
        ? `${input.outstandingCount} open invoice${input.outstandingCount === 1 ? "" : "s"} · ${formatMoney(input.outstandingAmount, input.currency)} outstanding`
        : "No open vendor invoices",
    metrics: [
      { label: "Open", value: input.outstandingCount },
      { label: "Outstanding", value: formatMoney(input.outstandingAmount, input.currency) },
      { label: "Paid out", value: input.paidOutCount },
    ],
    recommendation:
      input.outstandingCount > 0
        ? "Review commission breakdown and request payout when balances are available."
        : "Completed orders generate invoice lines automatically after delivery confirmation.",
    href: `${VENDOR_PORTAL_BASE_PATH}/invoices`,
  };
}

export function buildVendorAnalyticsModule(input: {
  revenue30d: number;
  orders30d: number;
  repeatBuyerRate: number;
  avgRating: number | null;
  currency: string;
}): VendorPortalModuleSnapshot {
  const score = input.orders30d === 0 ? -1 : input.repeatBuyerRate < 15 ? 1 : 0;

  return {
    module: "analytics",
    label: "Analytics",
    status: moduleStatus(score),
    headline:
      input.orders30d > 0
        ? `${formatMoney(input.revenue30d, input.currency)} revenue · ${input.orders30d} orders (30d)`
        : "Analytics populate after your first marketplace orders",
    metrics: [
      { label: "Revenue 30d", value: formatMoney(input.revenue30d, input.currency) },
      { label: "Orders 30d", value: input.orders30d },
      { label: "Repeat buyers", value: `${input.repeatBuyerRate}%` },
    ],
    recommendation:
      input.avgRating != null && input.avgRating < 4
        ? "Buyer ratings are below 4.0 — review fulfillment SLAs and product accuracy."
        : input.repeatBuyerRate < 20
          ? "Launch reorder promos for repeat buyers in your top SKUs."
          : "Use product performance and inventory forecast tabs to plan catalog updates.",
    href: `${VENDOR_PORTAL_BASE_PATH}/analytics`,
  };
}

export function buildVendorPortalHub(input: {
  vendorId: string;
  vendorName: string;
  currency: string;
  ordersActive: number;
  ordersPending: number;
  ordersMonth: number;
  outstandingCount: number;
  outstandingAmount: number;
  paidOutCount: number;
  revenue30d: number;
  orders30d: number;
  repeatBuyerRate: number;
  avgRating: number | null;
  recentOrders: VendorPortalRecentOrder[];
  recentInvoices: VendorPortalInvoiceRow[];
  analyticsHighlights: VendorPortalAnalyticsHighlight[];
  analyzedAt?: Date;
}): VendorPortalHub {
  const modules: VendorPortalModuleSnapshot[] = [
    buildVendorOrdersModule({
      ordersActive: input.ordersActive,
      ordersPending: input.ordersPending,
      ordersMonth: input.ordersMonth,
    }),
    buildVendorInvoicesModule({
      outstandingCount: input.outstandingCount,
      outstandingAmount: input.outstandingAmount,
      paidOutCount: input.paidOutCount,
      currency: input.currency,
    }),
    buildVendorAnalyticsModule({
      revenue30d: input.revenue30d,
      orders30d: input.orders30d,
      repeatBuyerRate: input.repeatBuyerRate,
      avgRating: input.avgRating,
      currency: input.currency,
    }),
  ];

  return {
    policyId: VENDOR_PORTAL_POLICY_ID,
    vendorId: input.vendorId,
    vendorName: input.vendorName,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    modules,
    recentOrders: input.recentOrders,
    recentInvoices: input.recentInvoices,
    analyticsHighlights: input.analyticsHighlights,
    summary: {
      ordersActive: input.ordersActive,
      invoicesOutstanding: input.outstandingCount,
      revenue30d: input.revenue30d,
      currency: input.currency,
    },
    basePath: VENDOR_PORTAL_BASE_PATH,
  };
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
