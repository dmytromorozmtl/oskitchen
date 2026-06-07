import { CHART_OF_ACCOUNTS_MAPPING_PNL_LINE_KEYS } from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";

/** Human-readable labels for P&L line keys in mapping UI. */
export const CHART_OF_ACCOUNTS_MAPPING_PNL_LABELS: Record<
  (typeof CHART_OF_ACCOUNTS_MAPPING_PNL_LINE_KEYS)[number],
  string
> = {
  revenue: "Food & beverage sales",
  food_cost: "Food cost (COGS)",
  labor: "Labor cost",
  occupancy: "Occupancy",
  supplies: "Operating supplies",
  repairs: "Repairs & maintenance",
  marketing: "Marketing",
  admin: "Admin & G&A",
};

export const CHART_OF_ACCOUNTS_MAPPING_INTEGRATION_TARGETS = [
  {
    id: "quickbooks",
    label: "QuickBooks Online",
    maturity: "LIVE" as const,
    dashboardPath: "/dashboard/integrations/quickbooks/live",
  },
  {
    id: "xero",
    label: "Xero",
    maturity: "SKIPPED" as const,
    dashboardPath: "/dashboard/integrations",
  },
] as const;
