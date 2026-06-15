import {
  SALES_BY_STAFF_P2_112_CAPABILITY_COUNT,
  SALES_BY_STAFF_P2_112_POS_ROUTE,
  SALES_BY_STAFF_P2_112_ROUTE,
} from "@/lib/analytics/sales-by-staff-p2-112-policy";

export const SALES_BY_STAFF_P2_112_EYEBROW =
  "Sales-by-staff · server performance" as const;

export const SALES_BY_STAFF_P2_112_HEADLINE =
  "Sales by server and average check per shift" as const;

export const SALES_BY_STAFF_P2_112_SUBLINE =
  "Three server analytics views — total sales attributed to each staff member, average check per shift, and ranked leaderboard. BETA: verify against POS shift closeout — typical directional metrics, not certified payroll audit." as const;

export const SALES_BY_STAFF_P2_112_CAPABILITIES = [
  {
    id: "server-sales",
    label: "Sales by server",
    description: "Total completed POS sales attributed to each staff member.",
    module: "services/pos/pos-checkout-service.ts",
    route: SALES_BY_STAFF_P2_112_ROUTE,
  },
  {
    id: "avg-check",
    label: "Avg check per shift",
    description: "Average transaction total per shift — total sales ÷ order count.",
    module: "lib/pos/pos-shift-closeout-math.ts",
    route: SALES_BY_STAFF_P2_112_ROUTE,
  },
  {
    id: "leaderboard",
    label: "Server leaderboard",
    description: "Ranked staff by sales volume with order count and avg check.",
    module: "services/pos/pos-shift-service.ts",
    route: SALES_BY_STAFF_P2_112_POS_ROUTE,
  },
] as const;

export const SALES_BY_STAFF_P2_112_OPERATOR_LINKS = [
  { label: "POS terminal", href: SALES_BY_STAFF_P2_112_POS_ROUTE },
  { label: "Menu engineering", href: "/dashboard/analytics/menu-engineering" },
  { label: "Food cost analytics", href: "/dashboard/analytics/food-cost" },
] as const;

export { SALES_BY_STAFF_P2_112_CAPABILITY_COUNT, SALES_BY_STAFF_P2_112_ROUTE };
