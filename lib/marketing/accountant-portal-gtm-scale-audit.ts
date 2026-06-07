import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ACCOUNTANT_PORTAL_ABSOLUTE_FINAL_POLICY_ID,
  ACCOUNTANT_PORTAL_COMPONENT_PATH,
  ACCOUNTANT_PORTAL_ROUTE,
} from "@/lib/accounting/accountant-portal-absolute-final-policy";
import { CHART_OF_ACCOUNTS_MAPPING_ROUTE } from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
import { GL_DEPTH_ACCOUNTING_ROUTE } from "@/lib/accounting/gl-depth-accounting-policy";
import {
  ACCOUNTANT_PORTAL_GTM_SCALE_DOC_PATH,
  ACCOUNTANT_PORTAL_GTM_SCALE_HONESTY_MARKERS,
  ACCOUNTANT_PORTAL_GTM_SCALE_WIRING_PATHS,
} from "@/lib/marketing/accountant-portal-gtm-scale-absolute-final-policy";

export type AccountantPortalGtmScaleAudit = {
  ok: boolean;
  failures: string[];
};

export function auditAccountantPortalGtmScaleWiring(
  root = process.cwd(),
): AccountantPortalGtmScaleAudit {
  const failures: string[] = [];

  for (const rel of ACCOUNTANT_PORTAL_GTM_SCALE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docSource = readFileSync(join(root, ACCOUNTANT_PORTAL_GTM_SCALE_DOC_PATH), "utf8");
  const componentSource = readFileSync(join(root, ACCOUNTANT_PORTAL_COMPONENT_PATH), "utf8");

  for (const marker of ACCOUNTANT_PORTAL_GTM_SCALE_HONESTY_MARKERS) {
    if (!docSource.includes(marker)) {
      failures.push(`doc missing honesty marker: ${marker}`);
    }
  }

  if (!docSource.includes(ACCOUNTANT_PORTAL_COMPONENT_PATH)) {
    failures.push("doc missing feature component path");
  }

  if (!docSource.includes(ACCOUNTANT_PORTAL_ROUTE)) {
    failures.push("doc missing accountant portal route");
  }

  if (!docSource.includes(GL_DEPTH_ACCOUNTING_ROUTE)) {
    failures.push("doc missing GL-depth sync cross-link");
  }

  if (!docSource.includes(CHART_OF_ACCOUNTS_MAPPING_ROUTE)) {
    failures.push("doc missing chart of accounts mapping cross-link");
  }

  if (
    !componentSource.includes("accountant-portal-absolute-final-v1") &&
    !componentSource.includes(ACCOUNTANT_PORTAL_ABSOLUTE_FINAL_POLICY_ID)
  ) {
    failures.push("component missing feature policy id");
  }

  if (!docSource.includes("accountant-portal-gtm-scale-absolute-final-v1")) {
    failures.push("doc missing GTM policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
