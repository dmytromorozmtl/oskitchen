import {
  MENU_ENGINEERING_P2_105_CAPABILITY_COUNT,
  MENU_ENGINEERING_P2_105_REPORTS_ROUTE,
  MENU_ENGINEERING_P2_105_ROUTE,
} from "@/lib/analytics/menu-engineering-p2-105-policy";

export const MENU_ENGINEERING_P2_105_EYEBROW =
  "Menu engineering · Stars / Plowhorses / Puzzles / Dogs" as const;

export const MENU_ENGINEERING_P2_105_HEADLINE =
  "Popularity vs profitability matrix with quadrant action recommendations" as const;

export const MENU_ENGINEERING_P2_105_SUBLINE =
  "Three menu engineering views — Stars (promote), Plowhorses & Puzzles (optimize margin or visibility), and Dogs (retire or rework). BETA: verify with recipe costs — typical directional matrix, not certified menu audit." as const;

export const MENU_ENGINEERING_P2_105_CAPABILITIES = [
  {
    id: "stars",
    label: "Stars",
    description: "High popularity + high margin — protect and promote on menu.",
    module: "lib/analytics/menu-engineering-p2-105-operations.ts",
    route: MENU_ENGINEERING_P2_105_ROUTE,
  },
  {
    id: "plow-puzzle",
    label: "Plowhorses & Puzzles",
    description: "Plowhorses (popular, low margin) and Puzzles (high margin, low sales).",
    module: "services/analytics/menu-engineering-service.ts",
    route: MENU_ENGINEERING_P2_105_REPORTS_ROUTE,
  },
  {
    id: "dogs",
    label: "Dogs & actions",
    description: "Low popularity + low margin — retire, rework, or bundle.",
    module: "lib/analytics/menu-engineering-p2-105-operations.ts",
    route: MENU_ENGINEERING_P2_105_ROUTE,
  },
] as const;

export const MENU_ENGINEERING_P2_105_OPERATOR_LINKS = [
  { label: "Reports matrix", href: MENU_ENGINEERING_P2_105_REPORTS_ROUTE },
  { label: "Recipe costing", href: "/dashboard/costing/recipe-engine" },
  { label: "Food cost analytics", href: "/dashboard/analytics/food-cost" },
] as const;

export { MENU_ENGINEERING_P2_105_CAPABILITY_COUNT, MENU_ENGINEERING_P2_105_ROUTE };
