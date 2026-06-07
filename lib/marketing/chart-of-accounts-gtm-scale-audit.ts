import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CHART_OF_ACCOUNTS_MAPPING_ABSOLUTE_FINAL_POLICY_ID,
  CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH,
  CHART_OF_ACCOUNTS_MAPPING_ROUTE,
} from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
import { GL_DEPTH_ACCOUNTING_ROUTE } from "@/lib/accounting/gl-depth-accounting-policy";
import {
  CHART_OF_ACCOUNTS_GTM_SCALE_DOC_PATH,
  CHART_OF_ACCOUNTS_GTM_SCALE_HONESTY_MARKERS,
  CHART_OF_ACCOUNTS_GTM_SCALE_WIRING_PATHS,
} from "@/lib/marketing/chart-of-accounts-gtm-scale-absolute-final-policy";

export type ChartOfAccountsGtmScaleAudit = {
  ok: boolean;
  failures: string[];
};

export function auditChartOfAccountsGtmScaleWiring(
  root = process.cwd(),
): ChartOfAccountsGtmScaleAudit {
  const failures: string[] = [];

  for (const rel of CHART_OF_ACCOUNTS_GTM_SCALE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docSource = readFileSync(join(root, CHART_OF_ACCOUNTS_GTM_SCALE_DOC_PATH), "utf8");
  const componentSource = readFileSync(join(root, CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH), "utf8");

  for (const marker of CHART_OF_ACCOUNTS_GTM_SCALE_HONESTY_MARKERS) {
    if (!docSource.includes(marker)) {
      failures.push(`doc missing honesty marker: ${marker}`);
    }
  }

  if (!docSource.includes(CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH)) {
    failures.push("doc missing feature component path");
  }

  if (!docSource.includes(CHART_OF_ACCOUNTS_MAPPING_ROUTE)) {
    failures.push("doc missing chart of accounts mapping route");
  }

  if (!docSource.includes(GL_DEPTH_ACCOUNTING_ROUTE)) {
    failures.push("doc missing GL-depth sync cross-link");
  }

  if (
    !componentSource.includes("chart-of-accounts-mapping-absolute-final-v1") &&
    !componentSource.includes(CHART_OF_ACCOUNTS_MAPPING_ABSOLUTE_FINAL_POLICY_ID)
  ) {
    failures.push("component missing feature policy id");
  }

  if (!docSource.includes("chart-of-accounts-gtm-scale-absolute-final-v1")) {
    failures.push("doc missing GTM policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
