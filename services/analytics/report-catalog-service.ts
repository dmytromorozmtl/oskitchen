/**
 * Report catalog — 100+ operational and financial reports for search, filters, and builder.
 * Wired reports link to `REPORT_REGISTRY`; catalog templates are honest previews until runners ship.
 */
import type { ReportKey } from "@/lib/reports/report-types";
import { REPORT_REGISTRY, listReportDefinitions } from "@/lib/reports/report-registry";

export const REPORT_CATALOG_CATEGORIES = [
  "Sales",
  "Labor",
  "Inventory",
  "Finance",
  "Customers",
  "Operations",
] as const;

export type ReportCatalogCategory = (typeof REPORT_CATALOG_CATEGORIES)[number];

export type ReportCatalogExportFormat = "pdf" | "csv" | "xlsx" | "google_sheets";

export type ReportCatalogStatus = "available" | "catalog_template" | "builder";

export type ReportCatalogEntry = {
  id: string;
  title: string;
  description: string;
  category: ReportCatalogCategory;
  metrics: string[];
  groupBy: string[];
  exportFormats: ReportCatalogExportFormat[];
  registryKey: ReportKey | null;
  generatorRoute: string;
  status: ReportCatalogStatus;
  recommendedRoles: string[];
  tags: string[];
};

export type ReportCatalogSearchParams = {
  query?: string;
  category?: ReportCatalogCategory | "all";
  role?: string | null;
};

export type CustomReportBuilderSpec = {
  title: string;
  metrics: string[];
  groupBy: string[];
  dateRange: "7d" | "30d" | "90d" | "custom";
  locationIds: string[];
  exportFormat: ReportCatalogExportFormat;
  schedule: "none" | "daily" | "weekly" | "monthly";
};

function entry(
  partial: Omit<ReportCatalogEntry, "registryKey" | "generatorRoute" | "status"> & {
    registryKey?: ReportKey | null;
    generatorRoute?: string;
    status?: ReportCatalogStatus;
  },
): ReportCatalogEntry {
  return {
    ...partial,
    registryKey: partial.registryKey ?? null,
    generatorRoute:
      partial.generatorRoute ??
      `/dashboard/reports/catalog/builder?template=${encodeURIComponent(partial.id)}`,
    status: partial.status ?? "catalog_template",
  };
}

const REGISTRY_TITLE_ALIASES: Partial<Record<ReportKey, string>> = {
  inventory_shortage_report: "Low-stock alerts",
  ingredient_demand: "Ingredient demand forecast",
  margin_report: "Margin by item",
  purchasing_report: "Purchasing spend",
  customer_report: "Customer LTV",
  customer_retention: "Retention cohort",
  meal_plan_subscriptions: "Meal plan subscribers",
  catering_pipeline: "Catering client pipeline",
  delivery_report: "Delivery on-time %",
};

function applyRegistryLinks(entries: ReportCatalogEntry[]): ReportCatalogEntry[] {
  return entries.map((entry) => {
    const wired = Object.values(REPORT_REGISTRY).find((def) => {
      const catalogTitle = REGISTRY_TITLE_ALIASES[def.key] ?? def.title;
      return catalogTitle === entry.title;
    });
    if (!wired || wired.status !== "available") return entry;
    return {
      ...entry,
      registryKey: wired.key,
      generatorRoute: wired.generatorRoute,
      status: "available" as const,
      exportFormats: wired.availableFormats.includes("csv")
        ? (["csv", "pdf", "xlsx"] as ReportCatalogExportFormat[])
        : entry.exportFormats,
    };
  });
}

function titles(category: ReportCatalogCategory, stems: string[]): ReportCatalogEntry[] {
  return stems.map((stem) => {
    const slug = `${category.toLowerCase()}-${stem.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    return entry({
      id: slug,
      title: stem,
      description: `${stem} for the selected date range, locations, and grouping.`,
      category,
      metrics: defaultMetrics(category),
      groupBy: defaultGroupBy(category),
      exportFormats: ["csv", "pdf", "xlsx"],
      recommendedRoles: defaultRoles(category),
      tags: [category.toLowerCase(), stem.toLowerCase().split(" ")[0] ?? "report"],
    });
  });
}

function defaultMetrics(category: ReportCatalogCategory): string[] {
  const map: Record<ReportCatalogCategory, string[]> = {
    Sales: ["revenue", "orders", "aov"],
    Labor: ["labor_cost", "labor_pct", "hours"],
    Inventory: ["on_hand", "depletion", "variance"],
    Finance: ["cogs", "margin", "cash_flow"],
    Customers: ["ltv", "frequency", "retention"],
    Operations: ["table_turn", "accuracy", "bump_time"],
  };
  return map[category];
}

function defaultGroupBy(category: ReportCatalogCategory): string[] {
  const map: Record<ReportCatalogCategory, string[]> = {
    Sales: ["day", "hour", "item", "category", "server", "channel"],
    Labor: ["role", "shift", "location", "day"],
    Inventory: ["item", "category", "supplier", "location"],
    Finance: ["week", "month", "location", "category"],
    Customers: ["segment", "location", "channel"],
    Operations: ["station", "hour", "location"],
  };
  return map[category];
}

function defaultRoles(category: ReportCatalogCategory): string[] {
  const map: Record<ReportCatalogCategory, string[]> = {
    Sales: ["owner", "manager"],
    Labor: ["owner", "manager"],
    Inventory: ["manager", "operations"],
    Finance: ["owner", "finance"],
    Customers: ["owner", "marketing"],
    Operations: ["manager", "operations"],
  };
  return map[category];
}

const SALES_TITLES = [
  "Revenue report",
  "Orders report",
  "Sales by product",
  "Sales by item",
  "Sales by category",
  "Sales by hour",
  "Sales by day of week",
  "Sales by server",
  "Sales by channel",
  "Sales by payment method",
  "Sales by fulfillment type",
  "Sales by location",
  "Sales by brand",
  "Discount summary",
  "Void and refund summary",
  "Comp summary",
  "Tax collected",
  "Tips summary",
  "Average ticket trend",
  "Top 25 items",
  "Bottom 25 items",
  "Category mix %",
  "Hourly heatmap",
  "Daypart performance",
  "Promo code performance",
  "Gift card redemptions",
  "Catering sales",
  "Storefront vs POS mix",
];

const LABOR_TITLES = [
  "Labor cost %",
  "Labor cost by role",
  "Labor cost by location",
  "Scheduled vs actual hours",
  "Overtime summary",
  "Shift cost by day",
  "Clock-in variance",
  "Labor per cover",
  "Labor per order",
  "Sales per labor hour",
  "Manager override log",
  "Break compliance",
  "Staff task completion",
  "Open shift gaps",
  "Labor forecast vs actual",
  "Payroll export prep",
  "Role hours mix",
  "Part-time vs full-time mix",
  "Training hours",
  "Labor prime cost bridge",
];

const INVENTORY_TITLES = [
  "Stock levels",
  "Depletion rate",
  "Waste log",
  "Variance report",
  "Low-stock alerts",
  "Purchase order status",
  "Receiving variance",
  "Supplier price history",
  "Ingredient demand forecast",
  "Recipe cost drift",
  "Cross-channel inventory sync",
  "86 history",
  "Transfer between locations",
  "Count sheet",
  "Shrink summary",
];

const FINANCE_TITLES = [
  "Executive weekly summary",
  "Executive monthly summary",
  "P&L summary",
  "Cash flow",
  "COGS %",
  "Margin by item",
  "Margin by category",
  "Breakeven analysis",
  "Accounts receivable aging",
  "Accounts payable aging",
  "Purchasing spend",
  "Cost snapshot history",
  "A vs T variance",
  "Channel fee impact",
  "Tax liability",
  "Daily deposit reconciliation",
  "Budget vs actual",
];

const CUSTOMER_TITLES = [
  "Customer LTV",
  "Purchase frequency",
  "Average ticket by segment",
  "New vs returning",
  "Retention cohort",
  "Churn risk",
  "Email opt-in rate",
  "Loyalty points balance",
  "Gift card liability",
  "Catering client pipeline",
  "Meal plan subscribers",
  "Customer geography",
  "Review sentiment summary",
  "CRM notes export",
  "VIP segment performance",
];

const OPERATIONS_TITLES = [
  "Weekly production",
  "Table turn time",
  "Bump time by station",
  "Order accuracy",
  "KDS overdue tickets",
  "Packing accuracy",
  "Delivery on-time %",
  "Route efficiency",
  "Production completion",
  "Menu item prep time",
  "Integration health log",
  "Audit log report",
];

const GENERATED_CATALOG: ReportCatalogEntry[] = [
  ...titles("Sales", SALES_TITLES),
  ...titles("Labor", LABOR_TITLES),
  ...titles("Inventory", INVENTORY_TITLES),
  ...titles("Finance", FINANCE_TITLES),
  ...titles("Customers", CUSTOMER_TITLES),
  ...titles("Operations", OPERATIONS_TITLES),
  entry({
    id: "builder-custom",
    title: "Custom report builder",
    description: "Choose metrics, date range, locations, and group-by dimensions.",
    category: "Operations",
    metrics: ["revenue", "orders", "labor_pct", "food_cost_pct", "margin"],
    groupBy: ["day", "week", "location", "category", "channel"],
    exportFormats: ["csv", "pdf", "xlsx", "google_sheets"],
    registryKey: null,
    generatorRoute: "/dashboard/reports/catalog/builder",
    status: "builder",
    recommendedRoles: ["owner", "manager", "finance"],
    tags: ["builder", "custom"],
  }),
];

/** Full catalog — 100+ entries including wired registry reports. */
export function listReportCatalog(): ReportCatalogEntry[] {
  return applyRegistryLinks(GENERATED_CATALOG);
}

export function reportCatalogCount(): number {
  return listReportCatalog().length;
}

export function wiredReportCatalogCount(): number {
  return listReportCatalog().filter((entry) => entry.status === "available").length;
}

export function searchReportCatalog(params: ReportCatalogSearchParams = {}): ReportCatalogEntry[] {
  const query = params.query?.trim().toLowerCase() ?? "";
  const category = params.category ?? "all";
  const role = params.role?.trim().toLowerCase() ?? null;

  return listReportCatalog().filter((entry) => {
    if (category !== "all" && entry.category !== category) return false;
    if (role && !entry.recommendedRoles.some((r) => r.toLowerCase() === role)) return false;
    if (!query) return true;
    const haystack = [
      entry.title,
      entry.description,
      entry.category,
      ...entry.tags,
      ...entry.metrics,
      ...entry.groupBy,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function getRecommendedReportsForRole(role: string): ReportCatalogEntry[] {
  const normalized = role.trim().toLowerCase();
  const recommended = listReportCatalog().filter((entry) =>
    entry.recommendedRoles.some((r) => r.toLowerCase() === normalized),
  );
  return recommended.slice(0, 12);
}

export function getRecentlyRunReportKeys(): ReportKey[] {
  return listReportDefinitions().slice(0, 6).map((d) => d.key);
}

export function buildCustomReportPreview(spec: CustomReportBuilderSpec): {
  title: string;
  summary: string;
  suggestedRoute: string;
} {
  const metricLabel = spec.metrics.join(", ") || "revenue";
  const groupLabel = spec.groupBy.join(", ") || "day";
  return {
    title: spec.title || "Custom report",
    summary: `${metricLabel} grouped by ${groupLabel} · ${spec.dateRange} · export ${spec.exportFormat}${
      spec.schedule !== "none" ? ` · ${spec.schedule} email` : ""
    }`,
    suggestedRoute: `/dashboard/reports/library?q=${encodeURIComponent(metricLabel)}`,
  };
}

export function mergeRegistryIntoCatalogSummary(): {
  catalogTotal: number;
  wiredTotal: number;
  templateTotal: number;
  categories: Record<ReportCatalogCategory, number>;
} {
  const catalog = listReportCatalog();
  const categories = REPORT_CATALOG_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = catalog.filter((entry) => entry.category === category).length;
      return acc;
    },
    {} as Record<ReportCatalogCategory, number>,
  );
  return {
    catalogTotal: catalog.length,
    wiredTotal: catalog.filter((entry) => entry.status === "available").length,
    templateTotal: catalog.filter((entry) => entry.status === "catalog_template").length,
    categories,
  };
}
