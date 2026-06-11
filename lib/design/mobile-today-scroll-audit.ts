import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MOBILE_TODAY_COMMAND_CENTER_MODULE,
  MOBILE_TODAY_MIN_PLAYBOOK_COUNT,
  MOBILE_TODAY_PAGE_MODULE,
  MOBILE_TODAY_PLAYBOOK_GRID_TEST_ID,
  MOBILE_TODAY_PLAYBOOK_STRIP_MODULE,
  MOBILE_TODAY_RECOMMENDED_FETCH_LIMIT,
  MOBILE_TODAY_SCROLL_POLICY_ID,
  MOBILE_TODAY_STICKY_HEADER_TEST_ID,
} from "@/lib/design/mobile-today-scroll-policy";

export type MobileTodayScrollAuditSummary = {
  policyId: typeof MOBILE_TODAY_SCROLL_POLICY_ID;
  pagePresent: boolean;
  playbookStripPresent: boolean;
  commandCenterPresent: boolean;
  stickyHeaderWired: boolean;
  verticalPlaybookGridWired: boolean;
  minPlaybookCountWired: boolean;
  noHorizontalScrollWired: boolean;
  passed: boolean;
};

export function auditMobileTodayScroll(root = process.cwd()): MobileTodayScrollAuditSummary {
  const pagePath = join(root, MOBILE_TODAY_PAGE_MODULE);
  const stripPath = join(root, MOBILE_TODAY_PLAYBOOK_STRIP_MODULE);
  const commandCenterPath = join(root, MOBILE_TODAY_COMMAND_CENTER_MODULE);

  const pagePresent = existsSync(pagePath);
  const playbookStripPresent = existsSync(stripPath);
  const commandCenterPresent = existsSync(commandCenterPath);

  let stickyHeaderWired = false;
  let verticalPlaybookGridWired = false;
  let minPlaybookCountWired = false;
  let noHorizontalScrollWired = false;

  if (pagePresent) {
    const source = readFileSync(pagePath, "utf8");
    noHorizontalScrollWired =
      source.includes("MOBILE_TODAY_PAGE_CLASS") &&
      source.includes("MOBILE_TODAY_SCROLL_BODY_CLASS");
  }

  if (commandCenterPresent) {
    const source = readFileSync(commandCenterPath, "utf8");
    stickyHeaderWired =
      source.includes("MOBILE_TODAY_STICKY_HEADER_CLASS") &&
      source.includes("MOBILE_TODAY_STICKY_HEADER_TEST_ID");
  }

  if (playbookStripPresent) {
    const source = readFileSync(stripPath, "utf8");
    verticalPlaybookGridWired =
      source.includes("MOBILE_TODAY_PLAYBOOK_GRID_CLASS") &&
      source.includes("MOBILE_TODAY_PLAYBOOK_GRID_TEST_ID");
    minPlaybookCountWired =
      source.includes("MOBILE_TODAY_RECOMMENDED_FETCH_LIMIT") &&
      source.includes(`MOBILE_TODAY_MIN_PLAYBOOK_COUNT`);
    noHorizontalScrollWired =
      noHorizontalScrollWired &&
      !source.includes("overflow-x-auto") &&
      !source.includes("snap-x");
  }

  const passed =
    pagePresent &&
    playbookStripPresent &&
    commandCenterPresent &&
    stickyHeaderWired &&
    verticalPlaybookGridWired &&
    minPlaybookCountWired &&
    noHorizontalScrollWired &&
    MOBILE_TODAY_RECOMMENDED_FETCH_LIMIT >= MOBILE_TODAY_MIN_PLAYBOOK_COUNT;

  return {
    policyId: MOBILE_TODAY_SCROLL_POLICY_ID,
    pagePresent,
    playbookStripPresent,
    commandCenterPresent,
    stickyHeaderWired,
    verticalPlaybookGridWired,
    minPlaybookCountWired,
    noHorizontalScrollWired,
    passed,
  };
}

export function formatMobileTodayScrollAuditLines(
  summary: MobileTodayScrollAuditSummary,
): string[] {
  return [
    `Mobile Today scroll audit (${summary.policyId})`,
    `Today page: ${summary.pagePresent ? "present" : "missing"} (${MOBILE_TODAY_PAGE_MODULE})`,
    `Playbook strip: ${summary.playbookStripPresent ? "present" : "missing"} (${MOBILE_TODAY_PLAYBOOK_STRIP_MODULE})`,
    `Sticky header: ${summary.stickyHeaderWired ? "yes" : "no"}`,
    `Vertical playbook grid (5+): ${summary.verticalPlaybookGridWired && summary.minPlaybookCountWired ? "yes" : "no"}`,
    `No horizontal scroll: ${summary.noHorizontalScrollWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
