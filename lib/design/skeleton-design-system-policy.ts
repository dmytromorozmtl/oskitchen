/**
 * Blueprint P1-58 — Skeleton design system (Table, CardGrid, KPI, Chart).
 *
 * @see lib/design/skeleton-design-system-policy.ts
 * @see components/feedback/skeleton-design-system.tsx
 */

export const SKELETON_DESIGN_SYSTEM_POLICY_ID = "skeleton-design-system-p1-58-v1" as const;

export const SKELETON_DESIGN_SYSTEM_PRIMITIVES = [
  "TableSkeleton",
  "CardGridSkeleton",
  "KPISkeleton",
  "ChartSkeleton",
] as const;

export type SkeletonDesignSystemPrimitive = (typeof SKELETON_DESIGN_SYSTEM_PRIMITIVES)[number];

export const SKELETON_DESIGN_SYSTEM_MODULE =
  "components/feedback/skeleton-design-system.tsx" as const;

export const SKELETON_DESIGN_SYSTEM_AUDIT_SCRIPT =
  "scripts/audit-skeleton-design-system.ts" as const;

export const SKELETON_DESIGN_SYSTEM_NPM_SCRIPT = "audit:skeleton-design-system" as const;

export const SKELETON_DESIGN_SYSTEM_UNIT_TEST =
  "tests/unit/skeleton-design-system.test.ts" as const;

export const SKELETON_DESIGN_SYSTEM_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const SKELETON_DESIGN_SYSTEM_TEST_IDS = {
  table: "table-skeleton",
  cardGrid: "card-grid-skeleton",
  kpi: "kpi-skeleton",
  chart: "chart-skeleton",
} as const;

/** Default grid counts for audit and Storybook parity. */
export const SKELETON_DESIGN_SYSTEM_DEFAULTS = {
  cardGridCount: 6,
  cardGridColumns: 3,
  kpiCount: 4,
  tableColumns: 4,
  tableRows: 8,
  chartHeightPx: 280,
} as const;

export {
  LOADING_SKELETON_IMPORT,
  SKELETON_PULSE_CLASS,
  SKELETON_SURFACE_CLASS,
} from "@/lib/design/loading-skeleton-patterns";
