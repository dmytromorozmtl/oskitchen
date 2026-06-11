import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { getNavMaturityExposure } from "@/lib/navigation/nav-maturity-governance";
import {
  isBlockedPreviewDashboardRoute,
  isPreviewRouteBlockExposure,
} from "@/lib/navigation/preview-route-guard";
import {
  PREVIEW_ROUTE_BLOCK_EXPOSURES,
  PREVIEW_ROUTE_GUARD_EXPECTED_MIN,
  PREVIEW_ROUTE_GUARD_POLICY_ID,
} from "@/lib/navigation/preview-route-guard-policy";

export type PreviewRouteAuditSummary = {
  policyId: typeof PREVIEW_ROUTE_GUARD_POLICY_ID;
  totalDashboardRoutes: number;
  blockedRouteCount: number;
  byExposure: Record<string, number>;
  expectedMin: typeof PREVIEW_ROUTE_GUARD_EXPECTED_MIN;
  passed: boolean;
};

function listDashboardRoutes(root: string): string[] {
  const dashboardRoot = join(root, "app/dashboard");
  const routes: string[] = [];

  function walk(dir: string): void {
    for (const entry of readdirSync(dir)) {
      const abs = join(dir, entry);
      if (statSync(abs).isDirectory()) {
        walk(abs);
        continue;
      }
      if (entry !== "page.tsx") continue;
      const rel = abs.slice(dashboardRoot.length + 1).replace(/\\/g, "/");
      const segs = rel.replace(/\/page\.tsx$/, "").split("/").filter(Boolean);
      routes.push(segs.length ? `/dashboard/${segs.join("/")}` : "/dashboard");
    }
  }

  walk(dashboardRoot);
  return routes;
}

export function auditPreviewRoutesHidden(root = process.cwd()): PreviewRouteAuditSummary {
  const routes = listDashboardRoutes(root);
  const byExposure: Record<string, number> = {};
  let blocked = 0;

  for (const route of routes) {
    const exposure = getNavMaturityExposure(route);
    byExposure[exposure] = (byExposure[exposure] ?? 0) + 1;
    if (isBlockedPreviewDashboardRoute(route)) blocked += 1;
  }

  return {
    policyId: PREVIEW_ROUTE_GUARD_POLICY_ID,
    totalDashboardRoutes: routes.length,
    blockedRouteCount: blocked,
    byExposure,
    expectedMin: PREVIEW_ROUTE_GUARD_EXPECTED_MIN,
    passed:
      blocked >= PREVIEW_ROUTE_GUARD_EXPECTED_MIN &&
      PREVIEW_ROUTE_BLOCK_EXPOSURES.every((exposure) =>
        isPreviewRouteBlockExposure(exposure),
      ),
  };
}

export function formatPreviewRouteAuditLines(summary: PreviewRouteAuditSummary): string[] {
  return [
    `Preview route guard audit (${summary.policyId})`,
    `Dashboard routes scanned: ${summary.totalDashboardRoutes}`,
    `Blocked (preview/hidden/internal): ${summary.blockedRouteCount}`,
    `Expected minimum: ${summary.expectedMin}`,
    ...PREVIEW_ROUTE_BLOCK_EXPOSURES.map(
      (exposure) => `  ${exposure}: ${summary.byExposure[exposure] ?? 0}`,
    ),
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
