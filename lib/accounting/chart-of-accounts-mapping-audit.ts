import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH,
  CHART_OF_ACCOUNTS_MAPPING_GL_SYNC_PAGE,
  CHART_OF_ACCOUNTS_MAPPING_HONESTY_MARKERS,
  CHART_OF_ACCOUNTS_MAPPING_PAGE_PATH,
  CHART_OF_ACCOUNTS_MAPPING_REQUIRED_MARKERS,
  CHART_OF_ACCOUNTS_MAPPING_ROUTE,
  CHART_OF_ACCOUNTS_MAPPING_SERVICE_PATH,
  CHART_OF_ACCOUNTS_MAPPING_STRIP_PATH,
  CHART_OF_ACCOUNTS_MAPPING_WIRING_PATHS,
} from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";

export type ChartOfAccountsMappingAudit = {
  ok: boolean;
  failures: string[];
};

export function auditChartOfAccountsMappingWiring(
  root = process.cwd(),
): ChartOfAccountsMappingAudit {
  const failures: string[] = [];

  for (const rel of CHART_OF_ACCOUNTS_MAPPING_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(join(root, CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH), "utf8");
  const pageSource = readFileSync(join(root, CHART_OF_ACCOUNTS_MAPPING_PAGE_PATH), "utf8");
  const serviceSource = readFileSync(join(root, CHART_OF_ACCOUNTS_MAPPING_SERVICE_PATH), "utf8");
  const stripSource = readFileSync(join(root, CHART_OF_ACCOUNTS_MAPPING_STRIP_PATH), "utf8");
  const glSyncPage = readFileSync(join(root, CHART_OF_ACCOUNTS_MAPPING_GL_SYNC_PAGE), "utf8");

  for (const marker of CHART_OF_ACCOUNTS_MAPPING_REQUIRED_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`component missing marker: ${marker}`);
    }
  }

  for (const marker of CHART_OF_ACCOUNTS_MAPPING_HONESTY_MARKERS) {
    if (!componentSource.includes(marker) && !pageSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!pageSource.includes("ChartOfAccountsMappingPanel")) {
    failures.push("page missing ChartOfAccountsMappingPanel");
  }

  if (!pageSource.includes("loadChartOfAccountsMappingModel")) {
    failures.push("page missing loadChartOfAccountsMappingModel");
  }

  if (!serviceSource.includes("loadCoaMappingRows")) {
    failures.push("service missing loadCoaMappingRows");
  }

  if (
    !stripSource.includes(CHART_OF_ACCOUNTS_MAPPING_ROUTE) &&
    !stripSource.includes("CHART_OF_ACCOUNTS_MAPPING_ROUTE")
  ) {
    failures.push("strip missing mapping route");
  }

  if (!glSyncPage.includes("ChartOfAccountsMappingStrip")) {
    failures.push("gl-sync page missing chart of accounts mapping strip");
  }

  if (!componentSource.includes("chart-of-accounts-mapping-absolute-final-v1")) {
    failures.push("component missing policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
