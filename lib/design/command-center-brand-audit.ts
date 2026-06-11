import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMMAND_CENTER_BRAND_FORBIDDEN_CLASSES,
  COMMAND_CENTER_BRAND_PAGE_MODULE,
  COMMAND_CENTER_BRAND_PANEL_MODULE,
  COMMAND_CENTER_BRAND_PANEL_TEST_ID,
  COMMAND_CENTER_BRAND_POLICY_ID,
  COMMAND_CENTER_BRAND_STICKY_HEADER_TEST_ID,
} from "@/lib/design/command-center-brand-policy";

export type CommandCenterBrandAuditSummary = {
  policyId: typeof COMMAND_CENTER_BRAND_POLICY_ID;
  pagePresent: boolean;
  panelPresent: boolean;
  stickyHeaderWired: boolean;
  todayTitleWired: boolean;
  cardTokensWired: boolean;
  terminalChromeRemoved: boolean;
  passed: boolean;
};

export function auditCommandCenterBrand(root = process.cwd()): CommandCenterBrandAuditSummary {
  const pagePath = join(root, COMMAND_CENTER_BRAND_PAGE_MODULE);
  const panelPath = join(root, COMMAND_CENTER_BRAND_PANEL_MODULE);

  const pagePresent = existsSync(pagePath);
  const panelPresent = existsSync(panelPath);

  let stickyHeaderWired = false;
  let todayTitleWired = false;
  let cardTokensWired = false;
  let terminalChromeRemoved = false;

  if (pagePresent) {
    const source = readFileSync(pagePath, "utf8");
    stickyHeaderWired =
      source.includes("COMMAND_CENTER_BRAND_STICKY_HEADER_CLASS") &&
      source.includes("COMMAND_CENTER_BRAND_STICKY_HEADER_TEST_ID");
    todayTitleWired =
      source.includes("COMMAND_CENTER_BRAND_PAGE_TITLE_CLASS") &&
      source.includes("COMMAND_CENTER_BRAND_PAGE_DESC_CLASS");
  }

  if (panelPresent) {
    const source = readFileSync(panelPath, "utf8");
    cardTokensWired =
      source.includes("COMMAND_CENTER_BRAND_PANEL_CLASS") &&
      source.includes("COMMAND_CENTER_BRAND_TICKER_CELL_CLASS") &&
      source.includes("COMMAND_CENTER_BRAND_PANEL_TEST_ID");
    terminalChromeRemoved = COMMAND_CENTER_BRAND_FORBIDDEN_CLASSES.every(
      (forbidden) => !source.includes(forbidden),
    );
  }

  const passed =
    pagePresent &&
    panelPresent &&
    stickyHeaderWired &&
    todayTitleWired &&
    cardTokensWired &&
    terminalChromeRemoved &&
    COMMAND_CENTER_BRAND_PANEL_TEST_ID === "command-center-panel" &&
    COMMAND_CENTER_BRAND_STICKY_HEADER_TEST_ID === "today-sticky-header";

  return {
    policyId: COMMAND_CENTER_BRAND_POLICY_ID,
    pagePresent,
    panelPresent,
    stickyHeaderWired,
    todayTitleWired,
    cardTokensWired,
    terminalChromeRemoved,
    passed,
  };
}

export function formatCommandCenterBrandAuditLines(
  summary: CommandCenterBrandAuditSummary,
): string[] {
  return [
    `Command Center brand audit (${summary.policyId})`,
    `Page module: ${summary.pagePresent ? "present" : "missing"} (${COMMAND_CENTER_BRAND_PAGE_MODULE})`,
    `Panel module: ${summary.panelPresent ? "present" : "missing"} (${COMMAND_CENTER_BRAND_PANEL_MODULE})`,
    `Sticky header (${COMMAND_CENTER_BRAND_STICKY_HEADER_TEST_ID}): ${summary.stickyHeaderWired ? "yes" : "no"}`,
    `Today title tokens: ${summary.todayTitleWired ? "yes" : "no"}`,
    `Card surface tokens: ${summary.cardTokensWired ? "yes" : "no"}`,
    `Terminal chrome removed: ${summary.terminalChromeRemoved ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
