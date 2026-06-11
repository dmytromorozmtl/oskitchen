import {
  TABLE_SERVICE_DEPTH_CAPABILITY_COUNT,
  TABLE_SERVICE_DEPTH_ROUTE,
} from "@/lib/pos/table-service-depth-policy";

export const TABLE_SERVICE_DEPTH_EYEBROW = "Table service depth · bar & dining room" as const;

export const TABLE_SERVICE_DEPTH_HEADLINE =
  "Split bills, merge tables, transfer seats, and reconcile tips" as const;

export const TABLE_SERVICE_DEPTH_SUBLINE =
  "Seven FOH workflows for browser-first POS — BETA depth, not production-ready Toast-class floor certification. typical rush-hour guidance — verify flows before external table-service claims." as const;

export const TABLE_SERVICE_DEPTH_CAPABILITIES = [
  {
    id: "table-service-split-bills",
    label: "Split bills",
    description: "Equal, percentage, seat, and item modes via BillSplitPanel on open tabs.",
    module: "lib/pos/bill-splitting.ts",
    route: "/dashboard/pos/tabs",
  },
  {
    id: "table-service-merge-tables",
    label: "Merge tables",
    description: "Combine open tabs from two tables into one party check — source tab closes.",
    module: "services/pos/table-service-depth-service.ts",
    route: "/dashboard/pos/table-service",
  },
  {
    id: "table-service-transfer-seats",
    label: "Transfer seats",
    description: "Bulk reassign seat assignments (paidById) when guests move chairs.",
    module: "services/pos/table-service-depth-service.ts",
    route: "/dashboard/pos/table-service",
  },
  {
    id: "table-service-tabs",
    label: "Tabs",
    description: "Open bar & table tabs, quick-add drinks, close with tax and tip.",
    module: "services/pos/tab-service.ts",
    route: "/dashboard/pos/tabs",
  },
  {
    id: "table-service-bar-mode",
    label: "Bar mode",
    description: "One-tap beer/wine/cocktail quick items on tabs — speed path for bar service.",
    module: "components/pos/tab-panel.tsx",
    route: "/dashboard/pos/tabs",
  },
  {
    id: "table-service-server-banking",
    label: "Server banking",
    description: "Aggregate declared tips from closed tabs grouped by server name prefix.",
    module: "lib/pos/table-service-depth-operations.ts",
    route: "/dashboard/pos/table-service",
  },
  {
    id: "table-service-tips-reconciliation",
    label: "Tips reconciliation",
    description: "Compare closed-tab tip totals vs shift-declared tips — flag variance for manager review.",
    module: "lib/pos/table-service-depth-operations.ts",
    route: "/dashboard/pos/table-service",
  },
] as const;

export const TABLE_SERVICE_DEPTH_OPERATOR_LINKS = [
  { label: "Bar & table tabs", href: "/dashboard/pos/tabs" },
  { label: "Floor plan tables", href: "/dashboard/tables" },
  { label: "Bill splitting guide", href: "/dashboard/pos/table-service#split" },
] as const;

export { TABLE_SERVICE_DEPTH_CAPABILITY_COUNT, TABLE_SERVICE_DEPTH_ROUTE };
