import type { VENDOR_PORTAL_POLICY_ID, VendorPortalModuleId } from "@/lib/marketplace/vendor-portal-policy";

export type VendorPortalModuleStatus = "healthy" | "watch" | "critical" | "idle";

export type VendorPortalModuleSnapshot = {
  module: VendorPortalModuleId;
  label: string;
  status: VendorPortalModuleStatus;
  headline: string;
  metrics: { label: string; value: string | number }[];
  recommendation: string;
  href: string;
};

export type VendorPortalRecentOrder = {
  id: string;
  poNumber: string | null;
  buyerName: string;
  total: number;
  currency: string;
  status: string;
  createdAtIso: string;
};

export type VendorPortalInvoiceRow = {
  id: string;
  purchaseOrderId: string;
  invoiceNumber: string;
  buyerName: string;
  grossAmount: number;
  netAmount: number;
  currency: string;
  status: string;
  issuedAtIso: string;
  href: string;
};

export type VendorPortalAnalyticsHighlight = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export type VendorPortalHub = {
  policyId: typeof VENDOR_PORTAL_POLICY_ID;
  vendorId: string;
  vendorName: string;
  generatedAtIso: string;
  modules: VendorPortalModuleSnapshot[];
  recentOrders: VendorPortalRecentOrder[];
  recentInvoices: VendorPortalInvoiceRow[];
  analyticsHighlights: VendorPortalAnalyticsHighlight[];
  summary: {
    ordersActive: number;
    invoicesOutstanding: number;
    revenue30d: number;
    currency: string;
  };
  basePath: string;
};

export type VendorInvoicesModel = {
  currency: string;
  outstandingAmount: number;
  paidOutAmount: number;
  pendingCount: number;
  availableCount: number;
  paidCount: number;
  invoices: VendorPortalInvoiceRow[];
  total: number;
  page: number;
  totalPages: number;
};
