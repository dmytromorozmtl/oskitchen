import { describe, expect, it } from "vitest";

import {
  POS_TERMINAL_CLIENT_PATH,
  POS_TERMINAL_PANEL_MAX_LINES,
  POS_TERMINAL_PANELS,
  POS_TERMINAL_SPLIT_POLICY_ID,
  auditPosTerminalSplitFromRoot,
} from "@/lib/pos/pos-terminal-split-policy";

describe("pos terminal split absolute final (Task 36)", () => {
  it("locks split policy id and four panel modules", () => {
    expect(POS_TERMINAL_SPLIT_POLICY_ID).toBe("pos-terminal-split-absolute-final-v1");
    expect(POS_TERMINAL_PANELS).toEqual([
      "components/dashboard/pos-terminal/cart-panel.tsx",
      "components/dashboard/pos-terminal/payment-panel.tsx",
      "components/dashboard/pos-terminal/modifier-panel.tsx",
      "components/dashboard/pos-terminal/receipt-panel.tsx",
    ]);
    expect(POS_TERMINAL_CLIENT_PATH).toBe("components/dashboard/pos-terminal-client.tsx");
  });

  it("keeps each extracted panel under 400 lines", () => {
    const audit = auditPosTerminalSplitFromRoot();
    for (const path of POS_TERMINAL_PANELS) {
      expect(audit.panelLineCounts[path]).toBeLessThanOrEqual(POS_TERMINAL_PANEL_MAX_LINES);
    }
  });

  it("composes CartPanel with payment, modifier, and receipt slots", () => {
    const audit = auditPosTerminalSplitFromRoot();
    expect(audit.clientUsesCartPanelComposition).toBe(true);
    expect(audit.panelCount).toBe(4);
  });

  it("shrinks pos-terminal-client below the pre-split 1655-line baseline", () => {
    const audit = auditPosTerminalSplitFromRoot();
    expect(audit.clientLineCount).toBeLessThan(1655);
    expect(audit.passed).toBe(true);
  });
});
