import {
  INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITY_COUNT,
  INVENTORY_VARIANCE_REPORT_P2_99_COUNTS_ROUTE,
  INVENTORY_VARIANCE_REPORT_P2_99_MANAGER_ROUTE,
  INVENTORY_VARIANCE_REPORT_P2_99_ROUTE,
} from "@/lib/inventory/inventory-variance-report-p2-99-policy";

export const INVENTORY_VARIANCE_REPORT_P2_99_EYEBROW =
  "Inventory variance · expected vs actual" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_HEADLINE =
  "Expected vs actual variance, theft/spoilage, and waste tracking" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_SUBLINE =
  "Three variance dimensions — count expected vs actual, theft/spoilage signals, and waste event tracking. BETA: verify with physical counts — typical directional report, not certified audit." as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITIES = [
  {
    id: "expected-vs-actual",
    label: "Expected vs actual",
    description: "Count-line variance — expected qty vs counted qty with dollar impact.",
    module: "services/inventory/count-service.ts",
    route: INVENTORY_VARIANCE_REPORT_P2_99_COUNTS_ROUTE,
  },
  {
    id: "theft-spoilage",
    label: "Theft / spoilage",
    description: "Theft detection scores and spoilage reason codes from waste events.",
    module: "lib/ai/inventory-manager-builders.ts",
    route: INVENTORY_VARIANCE_REPORT_P2_99_MANAGER_ROUTE,
  },
  {
    id: "waste-tracking",
    label: "Waste tracking",
    description: "Waste events by reason — prep loss, spoilage, overproduction, theft.",
    module: "services/inventory/waste-service.ts",
    route: INVENTORY_VARIANCE_REPORT_P2_99_ROUTE,
  },
] as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_OPERATOR_LINKS = [
  { label: "Inventory counts", href: INVENTORY_VARIANCE_REPORT_P2_99_COUNTS_ROUTE },
  { label: "AI Inventory Manager", href: INVENTORY_VARIANCE_REPORT_P2_99_MANAGER_ROUTE },
  { label: "Costing AVT", href: "/dashboard/costing" },
] as const;

export { INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITY_COUNT, INVENTORY_VARIANCE_REPORT_P2_99_ROUTE };
