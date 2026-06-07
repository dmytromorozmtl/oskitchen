import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DATA_VIZ_CONTRIBUTION_MARGIN_MODULE,
  DATA_VIZ_PROFIT_DASHBOARD_MODULE,
  DATA_VIZ_STANDARDS_WIRING_PATHS,
  DATA_VIZ_WATERFALL_MODULE,
} from "@/lib/analytics/data-viz-standards-policy";

export type DataVizStandardsAudit = {
  ok: boolean;
  failures: string[];
};

export function auditDataVizStandardsWiring(root = process.cwd()): DataVizStandardsAudit {
  const failures: string[] = [];

  for (const rel of DATA_VIZ_STANDARDS_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const dashboard = readFileSync(join(root, DATA_VIZ_PROFIT_DASHBOARD_MODULE), "utf8");
  if (!dashboard.includes("WaterfallChart")) {
    failures.push("real-time-profit-dashboard.tsx missing WaterfallChart");
  }
  if (!dashboard.includes("ContributionMarginChart")) {
    failures.push("real-time-profit-dashboard.tsx missing ContributionMarginChart");
  }

  const waterfall = readFileSync(join(root, DATA_VIZ_WATERFALL_MODULE), "utf8");
  if (!waterfall.includes("WATERFALL_CHART_TEST_ID")) {
    failures.push("waterfall-chart.tsx missing test id wiring");
  }

  const contribution = readFileSync(join(root, DATA_VIZ_CONTRIBUTION_MARGIN_MODULE), "utf8");
  if (!contribution.includes("CONTRIBUTION_MARGIN_CHART_TEST_ID")) {
    failures.push("contribution-margin-chart.tsx missing test id wiring");
  }

  return { ok: failures.length === 0, failures };
}
