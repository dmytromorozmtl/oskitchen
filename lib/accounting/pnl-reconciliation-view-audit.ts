import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PNL_RECONCILIATION_VIEW_COMPONENT_PATH,
  PNL_RECONCILIATION_VIEW_GL_SYNC_PAGE,
  PNL_RECONCILIATION_VIEW_HONESTY_MARKERS,
  PNL_RECONCILIATION_VIEW_PAGE_PATH,
  PNL_RECONCILIATION_VIEW_REQUIRED_MARKERS,
  PNL_RECONCILIATION_VIEW_ROUTE,
  PNL_RECONCILIATION_VIEW_SERVICE_PATH,
  PNL_RECONCILIATION_VIEW_STRIP_PATH,
  PNL_RECONCILIATION_VIEW_WIRING_PATHS,
} from "@/lib/accounting/pnl-reconciliation-view-absolute-final-policy";

export type PnlReconciliationViewAudit = {
  ok: boolean;
  failures: string[];
};

export function auditPnlReconciliationViewWiring(root = process.cwd()): PnlReconciliationViewAudit {
  const failures: string[] = [];

  for (const rel of PNL_RECONCILIATION_VIEW_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(join(root, PNL_RECONCILIATION_VIEW_COMPONENT_PATH), "utf8");
  const pageSource = readFileSync(join(root, PNL_RECONCILIATION_VIEW_PAGE_PATH), "utf8");
  const serviceSource = readFileSync(join(root, PNL_RECONCILIATION_VIEW_SERVICE_PATH), "utf8");
  const stripSource = readFileSync(join(root, PNL_RECONCILIATION_VIEW_STRIP_PATH), "utf8");
  const glSyncPage = readFileSync(join(root, PNL_RECONCILIATION_VIEW_GL_SYNC_PAGE), "utf8");

  for (const marker of PNL_RECONCILIATION_VIEW_REQUIRED_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`component missing marker: ${marker}`);
    }
  }

  for (const marker of PNL_RECONCILIATION_VIEW_HONESTY_MARKERS) {
    if (!componentSource.includes(marker) && !pageSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!pageSource.includes("PnlReconciliationViewPanel")) {
    failures.push("page missing PnlReconciliationViewPanel");
  }

  if (!pageSource.includes("loadPnlReconciliationViewModel")) {
    failures.push("page missing loadPnlReconciliationViewModel");
  }

  if (!serviceSource.includes("enrichPnlReconciliationRows")) {
    failures.push("service missing enrichPnlReconciliationRows");
  }

  if (
    !stripSource.includes(PNL_RECONCILIATION_VIEW_ROUTE) &&
    !stripSource.includes("PNL_RECONCILIATION_VIEW_ROUTE")
  ) {
    failures.push("strip missing reconciliation route");
  }

  if (!glSyncPage.includes("PnlReconciliationViewStrip")) {
    failures.push("gl-sync page missing pnl reconciliation strip");
  }

  if (!componentSource.includes("pnl-reconciliation-view-absolute-final-v1")) {
    failures.push("component missing policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
