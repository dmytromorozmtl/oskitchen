import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { GL_DEPTH_ACCOUNTING_ROUTE } from "@/lib/accounting/gl-depth-accounting-policy";
import { JOURNAL_ENTRY_EXPORT_ROUTE } from "@/lib/accounting/journal-entry-export-absolute-final-policy";
import {
  PNL_RECONCILIATION_VIEW_ABSOLUTE_FINAL_POLICY_ID,
  PNL_RECONCILIATION_VIEW_COMPONENT_PATH,
  PNL_RECONCILIATION_VIEW_ROUTE,
} from "@/lib/accounting/pnl-reconciliation-view-absolute-final-policy";
import {
  PNL_RECONCILIATION_GTM_SCALE_DOC_PATH,
  PNL_RECONCILIATION_GTM_SCALE_HONESTY_MARKERS,
  PNL_RECONCILIATION_GTM_SCALE_WIRING_PATHS,
} from "@/lib/marketing/pnl-reconciliation-gtm-scale-absolute-final-policy";

export type PnlReconciliationGtmScaleAudit = {
  ok: boolean;
  failures: string[];
};

export function auditPnlReconciliationGtmScaleWiring(
  root = process.cwd(),
): PnlReconciliationGtmScaleAudit {
  const failures: string[] = [];

  for (const rel of PNL_RECONCILIATION_GTM_SCALE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docSource = readFileSync(join(root, PNL_RECONCILIATION_GTM_SCALE_DOC_PATH), "utf8");
  const componentSource = readFileSync(join(root, PNL_RECONCILIATION_VIEW_COMPONENT_PATH), "utf8");

  for (const marker of PNL_RECONCILIATION_GTM_SCALE_HONESTY_MARKERS) {
    if (!docSource.includes(marker)) {
      failures.push(`doc missing honesty marker: ${marker}`);
    }
  }

  if (!docSource.includes(PNL_RECONCILIATION_VIEW_COMPONENT_PATH)) {
    failures.push("doc missing feature component path");
  }

  if (!docSource.includes(PNL_RECONCILIATION_VIEW_ROUTE)) {
    failures.push("doc missing P&L reconciliation view route");
  }

  if (!docSource.includes(GL_DEPTH_ACCOUNTING_ROUTE)) {
    failures.push("doc missing GL-depth sync cross-link");
  }

  if (!docSource.includes(JOURNAL_ENTRY_EXPORT_ROUTE)) {
    failures.push("doc missing journal entry export cross-link");
  }

  if (
    !componentSource.includes("pnl-reconciliation-view-absolute-final-v1") &&
    !componentSource.includes(PNL_RECONCILIATION_VIEW_ABSOLUTE_FINAL_POLICY_ID)
  ) {
    failures.push("component missing feature policy id");
  }

  if (!docSource.includes("pnl-reconciliation-gtm-scale-absolute-final-v1")) {
    failures.push("doc missing GTM policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
