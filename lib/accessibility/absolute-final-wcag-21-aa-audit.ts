import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  E2E_ACCESSIBILITY_AXE_WCAG_TAGS,
} from "@/lib/accessibility/e2e-accessibility-axe-policy";
import {
  DASHBOARD_SHELL_MODULE,
  SKIP_LINK_MAIN_LANDMARK_WIRING_PATHS,
} from "@/lib/accessibility/skip-link-main-landmark-policy";
import {
  WCAG_21_AA_DOC_PATH,
  WCAG_21_AA_SERIOUS_VIOLATION_GATE,
  WCAG_21_AA_TARGET_LEVEL,
  WCAG_21_AA_WIRING_PATHS,
} from "@/lib/accessibility/absolute-final-wcag-21-aa-policy";

export type Wcag21AaAudit = {
  ok: boolean;
  failures: string[];
};

export function auditWcag21AaWiring(root = process.cwd()): Wcag21AaAudit {
  const failures: string[] = [];

  for (const rel of WCAG_21_AA_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  for (const rel of SKIP_LINK_MAIN_LANDMARK_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing skip-link wiring path: ${rel}`);
    }
  }

  const docSource = readFileSync(join(root, WCAG_21_AA_DOC_PATH), "utf8");
  if (!docSource.includes(WCAG_21_AA_TARGET_LEVEL)) {
    failures.push("accessibility audit doc missing WCAG 2.1 AA target");
  }
  if (!docSource.includes("wcag21aa")) {
    failures.push("accessibility audit doc missing wcag21aa tag reference");
  }

  const dashboardSpec = readFileSync(
    join(root, "e2e/dashboard-accessibility-axe.spec.ts"),
    "utf8",
  );
  if (
    !dashboardSpec.includes("E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTES") &&
    !dashboardSpec.includes("wcag21aa")
  ) {
    failures.push("dashboard accessibility spec missing WCAG route wiring");
  }
  if (!dashboardSpec.includes("10")) {
    failures.push("dashboard accessibility spec missing 10-route coverage marker");
  }

  const axeAnalyze = readFileSync(
    join(root, "lib/accessibility/axe-playwright-analyze.ts"),
    "utf8",
  );
  if (!axeAnalyze.includes("E2E_ACCESSIBILITY_AXE_WCAG_TAGS")) {
    failures.push("axe playwright analyze missing WCAG tag import");
  }

  const shell = readFileSync(join(root, DASHBOARD_SHELL_MODULE), "utf8");
  if (!shell.includes("DashboardSkipLink")) {
    failures.push("dashboard shell missing skip link component");
  }

  const workflow = readFileSync(
    join(root, ".github/workflows/e2e-accessibility-axe.yml"),
    "utf8",
  );
  if (!workflow.includes("dashboard-accessibility-axe")) {
    failures.push("e2e accessibility workflow missing dashboard axe spec");
  }

  if (E2E_ACCESSIBILITY_AXE_WCAG_TAGS.length !== 4) {
    failures.push("expected 4 WCAG axe tags for 2.1 AA coverage");
  }

  if (WCAG_21_AA_SERIOUS_VIOLATION_GATE !== 0) {
    failures.push("WCAG 2.1 AA gate must require zero serious violations");
  }

  if (!docSource.includes("absolute-final-wcag-21-aa-v1")) {
    failures.push("accessibility audit doc missing WCAG 2.1 AA policy id");
  }

  return { ok: failures.length === 0, failures };
}
