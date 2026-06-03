import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import {
  NAV_MATURITY_HIDE_RULES,
  NAV_MATURITY_HIDE_TARGET,
  summarizeNavMaturityHideCoverage,
  type NavMaturityHideCoverage,
} from "@/lib/navigation/nav-maturity-hide-registry";

export const NAV_MATURITY_HIDE_METRICS_POLICY_ID = "nav-maturity-hide-des09-v1" as const;

/** Walk app dashboard page.tsx routes for hide coverage metrics. */
export function listDashboardPageRoutes(appRoot = join(process.cwd(), "app")): string[] {
  const pages: string[] = [];

  function walk(dir: string): void {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        walk(path);
        continue;
      }
      if (name === "page.tsx" || name === "page.ts") {
        pages.push(path);
      }
    }
  }

  walk(appRoot);

  const routes = pages.map((file) => {
    let seg = relative(appRoot, file).replace(/\\/g, "/").replace(/\/page\.(tsx|ts)$/, "");
    seg = seg.replace(/\([^/]+\)\//g, "").replace(/\([^/]+\)$/g, "");
    return seg ? `/${seg}` : "/";
  });

  return [...new Set(routes)]
    .filter((route) => route.startsWith("/dashboard"))
    .sort();
}

export function buildNavMaturityHideMetrics(): NavMaturityHideCoverage & {
  policyId: typeof NAV_MATURITY_HIDE_METRICS_POLICY_ID;
  hideRuleCount: number;
} {
  const routes = listDashboardPageRoutes();
  const summary = summarizeNavMaturityHideCoverage(routes);
  return {
    policyId: NAV_MATURITY_HIDE_METRICS_POLICY_ID,
    hideRuleCount: NAV_MATURITY_HIDE_RULES.length,
    ...summary,
  };
}
