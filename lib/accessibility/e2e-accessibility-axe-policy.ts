/**
 * Absolute Final Task 46 — E2E accessibility (axe-core) on 10 key dashboard pages.
 */

export const E2E_ACCESSIBILITY_AXE_POLICY_ID =
  "e2e-accessibility-axe-absolute-final-v1" as const;

/** WCAG 2.1 AA tags scanned by axe-core Playwright builder. */
export const E2E_ACCESSIBILITY_AXE_WCAG_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
] as const;

/**
 * Ten pilot-critical dashboard surfaces — aligned with top error-boundary routes.
 * Authed Playwright project required (`chromium-authed`).
 */
export const E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTES = [
  "/dashboard/today",
  "/dashboard/marketplace",
  "/dashboard/pos/terminal",
  "/dashboard/kitchen",
  "/dashboard/command-center",
  "/dashboard/analytics/suite",
  "/dashboard/ai/co-pilot",
  "/dashboard/enterprise/multi-location",
  "/dashboard/roles/owner",
  "/dashboard/menus",
] as const;

export const E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTE_COUNT =
  E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTES.length;

export const E2E_ACCESSIBILITY_AXE_SPEC_PATH =
  "e2e/dashboard-accessibility-axe.spec.ts" as const;

export const E2E_ACCESSIBILITY_AXE_WORKFLOW_PATH =
  ".github/workflows/e2e-accessibility-axe.yml" as const;

export const E2E_ACCESSIBILITY_AXE_CI_SCRIPTS = [
  "test:ci:e2e-accessibility-axe",
  "test:e2e:dashboard-a11y",
] as const;

export type AxeViolationImpact = "minor" | "moderate" | "serious" | "critical";

export type AxeViolationSummary = {
  id: string;
  impact: AxeViolationImpact | null;
  description: string;
  nodes: number;
};

export function isSeriousOrCriticalAxeImpact(
  impact: AxeViolationImpact | null | undefined,
): boolean {
  return impact === "serious" || impact === "critical";
}

export function summarizeAxeViolations(
  violations: ReadonlyArray<{
    id: string;
    impact?: AxeViolationImpact | null;
    description: string;
    nodes: ReadonlyArray<unknown>;
  }>,
): AxeViolationSummary[] {
  return violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact ?? null,
    description: violation.description,
    nodes: violation.nodes.length,
  }));
}

export function filterSeriousAxeViolations<
  T extends { impact?: AxeViolationImpact | null },
>(violations: readonly T[]): T[] {
  return violations.filter((violation) => isSeriousOrCriticalAxeImpact(violation.impact));
}
