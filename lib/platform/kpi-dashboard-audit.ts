import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KPI_DASHBOARD_DOC_PATH,
  KPI_DASHBOARD_HONESTY_MARKERS,
  KPI_DASHBOARD_METRIC_DEFINITIONS,
  KPI_DASHBOARD_METRIC_IDS,
  KPI_DASHBOARD_REQUIRED_HEADINGS,
  KPI_DASHBOARD_WIRING_PATHS,
} from "@/lib/platform/kpi-dashboard-absolute-final-policy";

export type KpiDashboardAudit = {
  ok: boolean;
  failures: string[];
  metricCount: number;
};

export function auditKpiDashboardDoc(source: string): Pick<KpiDashboardAudit, "metricCount"> & {
  missingHeadings: string[];
} {
  const missingHeadings = KPI_DASHBOARD_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const metricCount = KPI_DASHBOARD_METRIC_IDS.filter((id) =>
    source.toLowerCase().includes(id.replace("_", " ")) || source.includes(id),
  ).length;

  return { missingHeadings, metricCount };
}

export function auditKpiDashboardWiring(root = process.cwd()): KpiDashboardAudit {
  const failures: string[] = [];

  for (const rel of KPI_DASHBOARD_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const doc = readFileSync(join(root, KPI_DASHBOARD_DOC_PATH), "utf8");
  const docAudit = auditKpiDashboardDoc(doc);

  if (docAudit.missingHeadings.length > 0) {
    failures.push(`missing headings: ${docAudit.missingHeadings.join(", ")}`);
  }
  if (docAudit.metricCount < KPI_DASHBOARD_METRIC_IDS.length) {
    failures.push(`expected ${KPI_DASHBOARD_METRIC_IDS.length} KPI metric references in doc`);
  }

  for (const marker of KPI_DASHBOARD_HONESTY_MARKERS) {
    if (!doc.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!doc.includes("kpi-dashboard-absolute-final-v1")) {
    failures.push("kpi-dashboard.md missing absolute final policy id");
  }

  const policySource = readFileSync(
    join(root, "lib/platform/kpi-dashboard-absolute-final-policy.ts"),
    "utf8",
  );
  if (KPI_DASHBOARD_METRIC_DEFINITIONS.length !== KPI_DASHBOARD_METRIC_IDS.length) {
    failures.push("metric definitions count mismatch");
  }
  for (const metric of KPI_DASHBOARD_METRIC_DEFINITIONS) {
    if (!policySource.includes(`id: "${metric.id}"`)) {
      failures.push(`policy missing metric id: ${metric.id}`);
    }
  }

  return {
    ok: failures.length === 0,
    failures,
    metricCount: docAudit.metricCount,
  };
}
