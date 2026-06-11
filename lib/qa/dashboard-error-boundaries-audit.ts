import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  DASHBOARD_ERROR_BOUNDARIES_BLUEPRINT_POLICY_ID,
  DASHBOARD_ERROR_BOUNDARY_ROUTE_FILE,
} from "@/lib/qa/dashboard-error-boundaries-policy";

export type DashboardErrorBoundaryAuditRow = {
  routeDir: string;
  hasPage: boolean;
  hasErrorBoundary: boolean;
};

export type DashboardErrorBoundaryAuditReport = {
  policyId: typeof DASHBOARD_ERROR_BOUNDARIES_BLUEPRINT_POLICY_ID;
  pageRoutes: number;
  errorBoundaries: number;
  missing: string[];
  passed: boolean;
};

function isPageFile(name: string): boolean {
  return name === "page.tsx" || name === "page.ts";
}

export function collectDashboardPageRoutes(root = process.cwd()): string[] {
  const dashboardRoot = join(root, "app", "dashboard");
  const routes: string[] = [];

  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const absolutePath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }
      if (isPageFile(entry.name)) {
        routes.push(absolutePath.slice(root.length + 1).replace(/\\/g, "/"));
      }
    }
  }

  walk(dashboardRoot);
  return routes.sort();
}

export function dashboardRouteDirFromPage(pagePath: string): string {
  return pagePath.replace(/\/page\.tsx?$/, "");
}

export function auditDashboardErrorBoundaries(
  root = process.cwd(),
): DashboardErrorBoundaryAuditReport {
  const pageRoutes = collectDashboardPageRoutes(root);
  const missing: string[] = [];

  for (const pagePath of pageRoutes) {
    const routeDir = dashboardRouteDirFromPage(pagePath);
    const errorPath = join(root, routeDir, DASHBOARD_ERROR_BOUNDARY_ROUTE_FILE);
    if (!existsSync(errorPath)) {
      missing.push(routeDir);
    }
  }

  const errorBoundaries = pageRoutes.length - missing.length;

  return {
    policyId: DASHBOARD_ERROR_BOUNDARIES_BLUEPRINT_POLICY_ID,
    pageRoutes: pageRoutes.length,
    errorBoundaries,
    missing: missing.sort(),
    passed: missing.length === 0,
  };
}

export function assertDashboardErrorBoundariesAuditPasses(
  report: DashboardErrorBoundaryAuditReport,
): void {
  if (!report.passed) {
    throw new Error(
      `Missing dashboard error.tsx on ${report.missing.length} routes (first: ${report.missing[0] ?? "unknown"})`,
    );
  }
}
