import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SYNC_HEALTH_DASHBOARD_MARKETING_COMPONENT_PATH,
  SYNC_HEALTH_DASHBOARD_MARKETING_CONTENT_PATH,
  SYNC_HEALTH_DASHBOARD_MARKETING_PAGE_PATH,
  SYNC_HEALTH_DASHBOARD_MARKETING_ROUTE,
  SYNC_HEALTH_HONESTY_MARKERS,
  SYNC_HEALTH_IHC_MARKETING_LANDING_PATH,
  SYNC_HEALTH_INTEGRATION_HEALTH_DASHBOARD,
  SYNC_HEALTH_REQUIRED_MARKERS,
  SYNC_HEALTH_WIRING_PATHS,
} from "@/lib/marketing/sync-health-dashboard-marketing-absolute-final-policy";

export type SyncHealthDashboardMarketingAudit = {
  ok: boolean;
  failures: string[];
};

export function auditSyncHealthDashboardMarketingWiring(
  root = process.cwd(),
): SyncHealthDashboardMarketingAudit {
  const failures: string[] = [];

  for (const rel of SYNC_HEALTH_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(
    join(root, SYNC_HEALTH_DASHBOARD_MARKETING_COMPONENT_PATH),
    "utf8",
  );
  const contentSource = readFileSync(
    join(root, SYNC_HEALTH_DASHBOARD_MARKETING_CONTENT_PATH),
    "utf8",
  );
  const pageSource = readFileSync(join(root, SYNC_HEALTH_DASHBOARD_MARKETING_PAGE_PATH), "utf8");
  const ihcSource = readFileSync(join(root, SYNC_HEALTH_IHC_MARKETING_LANDING_PATH), "utf8");

  for (const marker of SYNC_HEALTH_REQUIRED_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`component missing marker: ${marker}`);
    }
  }

  for (const marker of SYNC_HEALTH_HONESTY_MARKERS) {
    if (!componentSource.includes(marker) && !contentSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!contentSource.includes(SYNC_HEALTH_DASHBOARD_MARKETING_ROUTE)) {
    failures.push("content missing marketing route");
  }

  if (!pageSource.includes("SyncHealthDashboardMarketing")) {
    failures.push("page missing SyncHealthDashboardMarketing");
  }

  if (!ihcSource.includes(SYNC_HEALTH_DASHBOARD_MARKETING_ROUTE)) {
    failures.push("IHC marketing landing missing sync-health link");
  }

  if (!componentSource.includes("SYNC_HEALTH_INTEGRATION_HEALTH_DASHBOARD")) {
    failures.push("component missing integration health dashboard link");
  }

  return { ok: failures.length === 0, failures };
}
