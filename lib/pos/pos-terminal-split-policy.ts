import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Absolute Final Task 36 — split pos-terminal-client into focused panel modules.
 */

export const POS_TERMINAL_SPLIT_POLICY_ID = "pos-terminal-split-absolute-final-v1" as const;

export const POS_TERMINAL_CLIENT_PATH =
  "components/dashboard/pos-terminal-client.tsx" as const;

export const POS_TERMINAL_PANELS = [
  "components/dashboard/pos-terminal/cart-panel.tsx",
  "components/dashboard/pos-terminal/payment-panel.tsx",
  "components/dashboard/pos-terminal/modifier-panel.tsx",
  "components/dashboard/pos-terminal/receipt-panel.tsx",
] as const;

export const POS_TERMINAL_PANEL_MAX_LINES = 400 as const;

export const POS_TERMINAL_SPLIT_CI_SCRIPTS = ["test:ci:pos-terminal-split"] as const;

export type PosTerminalSplitAudit = {
  policyId: typeof POS_TERMINAL_SPLIT_POLICY_ID;
  panelCount: number;
  panelLineCounts: Record<(typeof POS_TERMINAL_PANELS)[number], number>;
  clientLineCount: number;
  clientUsesCartPanelComposition: boolean;
  passed: boolean;
};

function countLines(root: string, relativePath: string): number {
  return readFileSync(join(root, relativePath), "utf8").split("\n").length;
}

export function auditPosTerminalSplitFromRoot(root = process.cwd()): PosTerminalSplitAudit {
  const clientSource = readFileSync(join(root, POS_TERMINAL_CLIENT_PATH), "utf8");
  const panelLineCounts = Object.fromEntries(
    POS_TERMINAL_PANELS.map((path) => [path, countLines(root, path)]),
  ) as PosTerminalSplitAudit["panelLineCounts"];

  const panelsWithinBudget = POS_TERMINAL_PANELS.every(
    (path) => panelLineCounts[path] <= POS_TERMINAL_PANEL_MAX_LINES,
  );

  const clientUsesCartPanelComposition =
    clientSource.includes("<CartPanel") &&
    clientSource.includes("paymentPanel={") &&
    clientSource.includes("modifierPanel={") &&
    clientSource.includes("receiptPanel={") &&
    clientSource.includes('from "@/components/dashboard/pos-terminal/cart-panel"');

  const clientLineCount = countLines(root, POS_TERMINAL_CLIENT_PATH);

  return {
    policyId: POS_TERMINAL_SPLIT_POLICY_ID,
    panelCount: POS_TERMINAL_PANELS.length,
    panelLineCounts,
    clientLineCount,
    clientUsesCartPanelComposition,
    passed:
      POS_TERMINAL_PANELS.length === 4 &&
      panelsWithinBudget &&
      clientUsesCartPanelComposition &&
      clientLineCount < 1655,
  };
}
