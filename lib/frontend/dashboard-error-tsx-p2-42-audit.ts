import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DASHBOARD_ERROR_TSX_P2_42_POLICY_ID,
  DASHBOARD_ERROR_TSX_P2_42_ROUTE_COUNT,
  DASHBOARD_ERROR_TSX_P2_42_ROUTES,
  errorUsesBoundaryTemplate,
} from "@/lib/frontend/dashboard-error-tsx-p2-42-policy";

export type DashboardErrorTsxP242AuditSummary = {
  policyId: typeof DASHBOARD_ERROR_TSX_P2_42_POLICY_ID;
  routeCount: number;
  errorPresentCount: number;
  templateCount: number;
  missing: string[];
  nonTemplate: string[];
  passed: boolean;
};

export function auditDashboardErrorTsxP242(
  root = process.cwd(),
): DashboardErrorTsxP242AuditSummary {
  const missing: string[] = [];
  const nonTemplate: string[] = [];
  let errorPresentCount = 0;
  let templateCount = 0;

  for (const route of DASHBOARD_ERROR_TSX_P2_42_ROUTES) {
    const errorPath = join(root, route.errorPath);
    if (!existsSync(errorPath)) {
      missing.push(route.errorPath);
      continue;
    }
    errorPresentCount += 1;
    const source = readFileSync(errorPath, "utf8");
    if (errorUsesBoundaryTemplate(source)) {
      templateCount += 1;
    } else {
      nonTemplate.push(route.errorPath);
    }
  }

  const passed =
    missing.length === 0 &&
    nonTemplate.length === 0 &&
    templateCount === DASHBOARD_ERROR_TSX_P2_42_ROUTE_COUNT;

  return {
    policyId: DASHBOARD_ERROR_TSX_P2_42_POLICY_ID,
    routeCount: DASHBOARD_ERROR_TSX_P2_42_ROUTE_COUNT,
    errorPresentCount,
    templateCount,
    missing,
    nonTemplate,
    passed,
  };
}

export function formatDashboardErrorTsxP242AuditLines(
  summary: DashboardErrorTsxP242AuditSummary,
): string[] {
  return [
    `Dashboard error.tsx wave (P2-42) audit (${summary.policyId})`,
    `Routes: ${summary.routeCount}`,
    `error.tsx present: ${summary.errorPresentCount}/${summary.routeCount}`,
    `ErrorBoundaryTemplate: ${summary.templateCount}/${summary.routeCount}`,
    `Missing: ${summary.missing.length}`,
    `Non-template: ${summary.nonTemplate.length}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
