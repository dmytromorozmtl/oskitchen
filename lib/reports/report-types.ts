import type { BusinessType, FulfillmentType, OrderStatus } from "@prisma/client";

import type { AnalyticsChannel } from "@/lib/analytics/channel-attribution";

/** Canonical report identifiers. Each must map to one entry in `REPORT_REGISTRY`. */
export type ReportKey =
  | "executive_weekly_summary"
  | "executive_monthly_summary"
  | "revenue_report"
  | "orders_report"
  | "sales_by_channel"
  | "sales_by_product"
  | "weekly_production"
  | "ingredient_demand"
  | "inventory_shortage_report"
  | "purchasing_report"
  | "packing_accuracy"
  | "delivery_report"
  | "margin_report"
  | "customer_report"
  | "customer_retention"
  | "catering_pipeline"
  | "meal_plan_subscriptions"
  | "staff_task_completion"
  | "audit_log_report";

export const REPORT_CATEGORIES = [
  "Executive",
  "Sales",
  "Operations",
  "Production",
  "Packing",
  "Delivery",
  "Customers",
  "Catering",
  "Meal Plans",
  "Inventory",
  "Purchasing",
  "Costing",
  "Compliance / Audit",
  "Staff",
] as const;
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const REPORT_FORMATS = ["csv", "browser_print", "pdf_placeholder", "json"] as const;
export type ReportFormat = (typeof REPORT_FORMATS)[number];

export type ReportFilterKey =
  | "dateRange"
  | "brandId"
  | "locationId"
  | "channel"
  | "fulfillmentType"
  | "status"
  | "customerSegment"
  | "productId"
  | "staffMemberId"
  | "routeId"
  | "eventType";

export type ReportFilters = {
  from: Date;
  to: Date;
  brandId: string | null;
  locationId: string | null;
  channel: AnalyticsChannel | null;
  fulfillmentType: FulfillmentType | null;
  status: OrderStatus | string | null;
  customerSegment: string | null;
  productId: string | null;
  staffMemberId: string | null;
  routeId: string | null;
  eventType: string | null;
};

export type ReportColumn = {
  /** Field key in returned `rows`. */
  key: string;
  /** Human label rendered in preview and CSV. */
  label: string;
  /** Right-align preview cell. */
  numeric?: boolean;
  /** Hide from non-financial actors (margin / revenue cells). */
  financial?: boolean;
  /** Mask in preview unless actor has PII permission. */
  pii?: boolean;
};

export type ReportSummaryKpi = {
  label: string;
  value: string;
  sub?: string | null;
};

export type ReportPermission =
  | "reports.read.operations"
  | "reports.read.financial"
  | "reports.read.customer_pii"
  | "reports.read.audit"
  | "reports.export"
  | "reports.saved.manage";

export type ReportDefinition = {
  key: ReportKey;
  title: string;
  description: string;
  category: ReportCategory;
  /** Empty array ⇒ available in every business mode. */
  businessModes: BusinessType[];
  /** Required permission to view + export. */
  requiredPermission: ReportPermission;
  /** Subscription tiers that unlock this report. Empty ⇒ all plans. */
  requiredPlans: string[];
  /** Surfaced in the library card. */
  availableFormats: ReportFormat[];
  /** Filters this report actually honours. */
  supportedFilters: ReportFilterKey[];
  /** Suggested preview/CSV columns. */
  columns: ReportColumn[];
  /** Optional legacy `/api/export?type=…` link. */
  legacyExportHref: string | null;
  /** Preview / generator route. */
  generatorRoute: string;
  /** Whether the registry has a runner wired up. */
  status: "available" | "beta" | "coming_soon";
  /** When true, this report exposes financial data and is restricted. */
  financial: boolean;
  /** Tags useful for searching ("weekly", "owner", …). */
  tags: string[];
};

export const DATE_PRESETS = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "wtd", label: "Week to date" },
  { id: "mtd", label: "Month to date" },
  { id: "qtd", label: "Quarter to date" },
  { id: "ytd", label: "Year to date" },
] as const;
export type DatePresetId = (typeof DATE_PRESETS)[number]["id"];

const REPORT_FORMAT_LABELS: Record<ReportFormat, string> = {
  csv: "CSV export",
  browser_print: "Print in browser",
  json: "JSON export",
  pdf_placeholder: "PDF (roadmap — use print or CSV today)",
};

/** Human-readable export labels for report library cards and UI. */
export function describeReportFormats(formats: readonly ReportFormat[]): string {
  return formats.map((f) => REPORT_FORMAT_LABELS[f] ?? f).join(" · ");
}
