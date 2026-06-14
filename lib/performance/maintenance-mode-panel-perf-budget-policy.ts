/**
 * Maintenance mode panel — Lighthouse perf budget (dashboard host pages).
 *
 * @see lighthouserc.maintenance-mode-panel.cjs
 * @see docs/maintenance-mode-panel-perf-budget-p2-53.md
 */

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_POLICY_ID =
  "maintenance-mode-panel-perf-budget-v1" as const;

/** Host pages that render MaintenanceModePanel (compact or platform variant). */
export const MAINTENANCE_MODE_PANEL_PERF_PATHS = [
  "/dashboard/today",
  "/platform/implementations",
] as const;

/** First Contentful Paint — dashboard budget (2.5s). */
export const MAINTENANCE_MODE_PANEL_FCP_MAX_MS = 2500 as const;

/** Largest Contentful Paint — dashboard budget (4s). */
export const MAINTENANCE_MODE_PANEL_LCP_MAX_MS = 4000 as const;

/** Cumulative Layout Shift — same as marketing CWV gate. */
export const MAINTENANCE_MODE_PANEL_CLS_MAX = 0.1 as const;

/** Total Blocking Time — interactive dashboard budget (350ms). */
export const MAINTENANCE_MODE_PANEL_TBT_MAX_MS = 350 as const;

/** Lighthouse performance category minimum (dashboard). */
export const MAINTENANCE_MODE_PANEL_PERFORMANCE_MIN_SCORE = 0.85 as const;

export const MAINTENANCE_MODE_PANEL_LHCI_CONFIG_PATH =
  "lighthouserc.maintenance-mode-panel.cjs" as const;

export const MAINTENANCE_MODE_PANEL_COMPONENT_PATH =
  "components/dashboard/maintenance/maintenance-mode-panel.tsx" as const;

export const MAINTENANCE_MODE_PANEL_TEST_ID = "maintenance-mode-panel" as const;

export type MaintenanceModePanelPerfMetrics = {
  fcpMs: number;
  lcpMs: number;
  cls: number;
  tbtMs?: number;
  performanceScore?: number;
};

export type MaintenanceModePanelPerfViolation = {
  metric: "fcp" | "lcp" | "cls" | "tbt" | "performance";
  value: number;
  max: number;
  message: string;
};

export function evaluateMaintenanceModePanelPerfBudget(
  metrics: MaintenanceModePanelPerfMetrics,
): MaintenanceModePanelPerfViolation[] {
  const violations: MaintenanceModePanelPerfViolation[] = [];

  if (metrics.fcpMs > MAINTENANCE_MODE_PANEL_FCP_MAX_MS) {
    violations.push({
      metric: "fcp",
      value: metrics.fcpMs,
      max: MAINTENANCE_MODE_PANEL_FCP_MAX_MS,
      message: `FCP ${metrics.fcpMs}ms exceeds ${MAINTENANCE_MODE_PANEL_FCP_MAX_MS}ms`,
    });
  }
  if (metrics.lcpMs > MAINTENANCE_MODE_PANEL_LCP_MAX_MS) {
    violations.push({
      metric: "lcp",
      value: metrics.lcpMs,
      max: MAINTENANCE_MODE_PANEL_LCP_MAX_MS,
      message: `LCP ${metrics.lcpMs}ms exceeds ${MAINTENANCE_MODE_PANEL_LCP_MAX_MS}ms`,
    });
  }
  if (metrics.cls > MAINTENANCE_MODE_PANEL_CLS_MAX) {
    violations.push({
      metric: "cls",
      value: metrics.cls,
      max: MAINTENANCE_MODE_PANEL_CLS_MAX,
      message: `CLS ${metrics.cls} exceeds ${MAINTENANCE_MODE_PANEL_CLS_MAX}`,
    });
  }
  if (
    metrics.tbtMs !== undefined &&
    metrics.tbtMs > MAINTENANCE_MODE_PANEL_TBT_MAX_MS
  ) {
    violations.push({
      metric: "tbt",
      value: metrics.tbtMs,
      max: MAINTENANCE_MODE_PANEL_TBT_MAX_MS,
      message: `TBT ${metrics.tbtMs}ms exceeds ${MAINTENANCE_MODE_PANEL_TBT_MAX_MS}ms`,
    });
  }
  if (
    metrics.performanceScore !== undefined &&
    metrics.performanceScore < MAINTENANCE_MODE_PANEL_PERFORMANCE_MIN_SCORE
  ) {
    violations.push({
      metric: "performance",
      value: metrics.performanceScore,
      max: MAINTENANCE_MODE_PANEL_PERFORMANCE_MIN_SCORE,
      message: `Performance score ${metrics.performanceScore} below ${MAINTENANCE_MODE_PANEL_PERFORMANCE_MIN_SCORE}`,
    });
  }

  return violations;
}

export function maintenanceModePanelPerfBudgetPass(
  metrics: MaintenanceModePanelPerfMetrics,
): boolean {
  return evaluateMaintenanceModePanelPerfBudget(metrics).length === 0;
}

export const MAINTENANCE_MODE_PANEL_LHCI_ASSERTIONS = {
  "first-contentful-paint": [
    "error",
    { maxNumericValue: MAINTENANCE_MODE_PANEL_FCP_MAX_MS },
  ],
  "largest-contentful-paint": [
    "error",
    { maxNumericValue: MAINTENANCE_MODE_PANEL_LCP_MAX_MS },
  ],
  "cumulative-layout-shift": ["error", { maxNumericValue: MAINTENANCE_MODE_PANEL_CLS_MAX }],
  "total-blocking-time": ["error", { maxNumericValue: MAINTENANCE_MODE_PANEL_TBT_MAX_MS }],
  "categories:performance": [
    "error",
    { minScore: MAINTENANCE_MODE_PANEL_PERFORMANCE_MIN_SCORE },
  ],
} as const;
