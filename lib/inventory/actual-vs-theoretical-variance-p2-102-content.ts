import {
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_AVT_ROUTE,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITY_COUNT,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_ROUTE,
} from "@/lib/inventory/actual-vs-theoretical-variance-p2-102-policy";

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_EYEBROW =
  "Actual vs theoretical · inventory dashboard tile" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_HEADLINE =
  "Separate dashboard tile for actual vs theoretical food cost variance" as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_SUBLINE =
  "Three AVT dimensions — dashboard variance tile, theoretical usage baseline, and actual depletion signals. BETA: verify with physical counts — typical directional report, not certified audit." as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITIES = [
  {
    id: "variance-tile",
    label: "Dashboard variance tile",
    description: "KPI tile — drift %, alert count, and top variance items at a glance.",
    module: "components/inventory/actual-vs-theoretical-variance-panel.tsx",
    route: ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_ROUTE,
  },
  {
    id: "theoretical-baseline",
    label: "Theoretical baseline",
    description: "Recipe-based theoretical food cost per menu item and sold quantity.",
    module: "services/costing/actual-vs-theoretical-service.ts",
    route: ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_AVT_ROUTE,
  },
  {
    id: "actual-depletion",
    label: "Actual depletion",
    description: "Receiving and count signals compared to theoretical usage — variance rows.",
    module: "services/costing/costing-alert-service.ts",
    route: ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_ROUTE,
  },
] as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_OPERATOR_LINKS = [
  { label: "Full AVT report", href: ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_AVT_ROUTE },
  { label: "Inventory variance", href: "/dashboard/inventory/variance-report" },
  { label: "Costing hub", href: "/dashboard/costing" },
] as const;

export {
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITY_COUNT,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_ROUTE,
};
