export type NativeBudgetCategoryKey =
  | "food_cost"
  | "labor"
  | "occupancy"
  | "supplies"
  | "repairs"
  | "marketing"
  | "admin"
  | "ebitda"
  | "net_income";

export type NativeBudgetCategoryTarget = {
  key: NativeBudgetCategoryKey;
  label: string;
  /** Share of revenue (0–1) used to compute budget dollars. */
  percentOfRevenue: number;
  description: string;
};

export type NativeBudgetSettings = {
  /** Optional fixed revenue target for the active period (USD). Falls back to actual revenue. */
  revenueTargetUsd: number | null;
  /** Operator overrides — percent of revenue per category key. */
  categoryOverrides: Partial<Record<NativeBudgetCategoryKey, number>>;
  updatedAt: string | null;
};

export type NativeBudgetVsActualLine = {
  key: NativeBudgetCategoryKey | "revenue" | "gross_profit";
  label: string;
  actual: number;
  budget: number;
  variance: number;
  variancePct: number | null;
  isSubtotal?: boolean;
};

export type NativeBudgetVsActualModel = {
  period: string;
  revenueActual: number;
  revenueBudget: number;
  lines: NativeBudgetVsActualLine[];
  usesOperatorTargets: boolean;
};
