import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ACCOUNTANT_PORTAL_COMPONENT_PATH,
  ACCOUNTANT_PORTAL_GL_SYNC_PAGE,
  ACCOUNTANT_PORTAL_HONESTY_MARKERS,
  ACCOUNTANT_PORTAL_PAGE_PATH,
  ACCOUNTANT_PORTAL_PILLARS,
  ACCOUNTANT_PORTAL_REQUIRED_MARKERS,
  ACCOUNTANT_PORTAL_ROUTE,
  ACCOUNTANT_PORTAL_SERVICE_PATH,
  ACCOUNTANT_PORTAL_STRIP_PATH,
  ACCOUNTANT_PORTAL_WIRING_PATHS,
} from "@/lib/accounting/accountant-portal-absolute-final-policy";

export type AccountantPortalAudit = {
  ok: boolean;
  failures: string[];
};

export function auditAccountantPortalWiring(root = process.cwd()): AccountantPortalAudit {
  const failures: string[] = [];

  for (const rel of ACCOUNTANT_PORTAL_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(join(root, ACCOUNTANT_PORTAL_COMPONENT_PATH), "utf8");
  const pageSource = readFileSync(join(root, ACCOUNTANT_PORTAL_PAGE_PATH), "utf8");
  const serviceSource = readFileSync(join(root, ACCOUNTANT_PORTAL_SERVICE_PATH), "utf8");
  const stripSource = readFileSync(join(root, ACCOUNTANT_PORTAL_STRIP_PATH), "utf8");
  const glSyncPage = readFileSync(join(root, ACCOUNTANT_PORTAL_GL_SYNC_PAGE), "utf8");

  for (const marker of ACCOUNTANT_PORTAL_REQUIRED_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`component missing marker: ${marker}`);
    }
  }

  for (const marker of ACCOUNTANT_PORTAL_HONESTY_MARKERS) {
    if (!componentSource.includes(marker) && !pageSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!pageSource.includes("AccountantPortalPanel")) {
    failures.push("page missing AccountantPortalPanel");
  }

  if (!pageSource.includes("loadAccountantPortalModel")) {
    failures.push("page missing loadAccountantPortalModel");
  }

  if (!serviceSource.includes("buildAccountantPortalDeliverables")) {
    failures.push("service missing deliverables builder");
  }

  if (
    !stripSource.includes(ACCOUNTANT_PORTAL_ROUTE) &&
    !stripSource.includes("ACCOUNTANT_PORTAL_ROUTE")
  ) {
    failures.push("strip missing portal route");
  }

  if (!glSyncPage.includes("AccountantPortalStrip")) {
    failures.push("gl-sync page missing accountant portal strip");
  }

  for (const pillar of ACCOUNTANT_PORTAL_PILLARS) {
    if (!componentSource.includes(pillar)) {
      failures.push(`component missing pillar: ${pillar}`);
    }
  }

  if (!componentSource.includes("accountant-portal-absolute-final-v1")) {
    failures.push("component missing policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
