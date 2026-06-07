import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DASHBOARD_MAIN_LANDMARK_ARIA_LABEL,
  DASHBOARD_MAIN_LANDMARK_ID,
  DASHBOARD_SHELL_MODULE,
  DASHBOARD_SKIP_LINK_MODULE,
  SKIP_LINK_MAIN_LANDMARK_WIRING_PATHS,
} from "@/lib/accessibility/skip-link-main-landmark-policy";

export type SkipLinkMainLandmarkAudit = {
  ok: boolean;
  failures: string[];
};

export function auditSkipLinkMainLandmarkWiring(root = process.cwd()): SkipLinkMainLandmarkAudit {
  const failures: string[] = [];

  for (const rel of SKIP_LINK_MAIN_LANDMARK_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const shell = readFileSync(join(root, DASHBOARD_SHELL_MODULE), "utf8");
  if (!shell.includes("DashboardSkipLink")) {
    failures.push("dashboard-shell.tsx missing DashboardSkipLink");
  }
  if (!shell.includes("DASHBOARD_MAIN_LANDMARK_ID")) {
    failures.push("dashboard-shell.tsx missing DASHBOARD_MAIN_LANDMARK_ID on main landmark");
  }
  if (!shell.includes("tabIndex={-1}")) {
    failures.push("dashboard-shell.tsx missing tabIndex={-1} on main landmark");
  }
  if (!shell.includes("DASHBOARD_MAIN_LANDMARK_ARIA_LABEL")) {
    failures.push("dashboard-shell.tsx missing aria-label on main landmark");
  }

  const skipLink = readFileSync(join(root, DASHBOARD_SKIP_LINK_MODULE), "utf8");
  if (!skipLink.includes("DASHBOARD_MAIN_LANDMARK_ID")) {
    failures.push("dashboard-skip-link.tsx missing landmark href target");
  }
  if (!skipLink.includes("dashboard-skip-link")) {
    failures.push("dashboard-skip-link.tsx missing data-testid");
  }

  return { ok: failures.length === 0, failures };
}
