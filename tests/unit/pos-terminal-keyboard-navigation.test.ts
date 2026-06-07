import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  POS_TERMINAL_KEYBOARD_NAVIGATION_CI_SCRIPTS,
  POS_TERMINAL_KEYBOARD_NAVIGATION_FLOW_COUNT,
  POS_TERMINAL_KEYBOARD_NAVIGATION_FLOWS,
  POS_TERMINAL_KEYBOARD_NAVIGATION_HELPER_PATH,
  POS_TERMINAL_KEYBOARD_NAVIGATION_POLICY_ID,
  POS_TERMINAL_KEYBOARD_NAVIGATION_ROUTE,
  POS_TERMINAL_KEYBOARD_NAVIGATION_SPEC_PATH,
  posTerminalKeyboardFlowIds,
} from "@/lib/pos/pos-terminal-keyboard-navigation-policy";
import { matchPosShortcut } from "@/lib/keyboard/shortcuts";

const ROOT = process.cwd();

describe("POS terminal keyboard navigation (Absolute Final Task 47)", () => {
  it("locks desktop route and eight keyboard flows", () => {
    expect(POS_TERMINAL_KEYBOARD_NAVIGATION_POLICY_ID).toBe(
      "pos-terminal-keyboard-navigation-absolute-final-v1",
    );
    expect(POS_TERMINAL_KEYBOARD_NAVIGATION_ROUTE).toBe("/dashboard/pos/terminal?speed=0");
    expect(POS_TERMINAL_KEYBOARD_NAVIGATION_FLOW_COUNT).toBe(8);
    expect(posTerminalKeyboardFlowIds()).toEqual([
      "focus_product_search",
      "show_shortcuts_overlay",
      "focus_customer_search",
      "quick_add_first_product",
      "increment_last_line",
      "clear_cart",
      "payment_cash",
      "tab_from_search",
    ]);
  });

  it("maps documented shortcut keys through matchPosShortcut", () => {
    const bodyTarget = { tagName: "BODY", isContentEditable: false };
    for (const flow of POS_TERMINAL_KEYBOARD_NAVIGATION_FLOWS) {
      if (flow.key === "Tab") continue;
      const event = {
        key: flow.key,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: flow.key === "?" ? true : false,
        target: bodyTarget,
        preventDefault: () => undefined,
      } as unknown as KeyboardEvent;
      expect(matchPosShortcut(event)).toBeTruthy();
    }
  });

  it("ships Playwright spec, helper, and npm scripts", () => {
    expect(readFileSync(join(ROOT, POS_TERMINAL_KEYBOARD_NAVIGATION_SPEC_PATH), "utf8")).toContain(
      "POS terminal keyboard navigation",
    );
    expect(readFileSync(join(ROOT, POS_TERMINAL_KEYBOARD_NAVIGATION_HELPER_PATH), "utf8")).toContain(
      "preparePosDesktopTerminal",
    );

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of POS_TERMINAL_KEYBOARD_NAVIGATION_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(pkg.scripts?.["test:e2e:pos-terminal-keyboard"]).toContain(
      POS_TERMINAL_KEYBOARD_NAVIGATION_SPEC_PATH,
    );

    const playwrightConfig = readFileSync(join(ROOT, "playwright.config.ts"), "utf8");
    expect(playwrightConfig).toContain("pos-terminal-keyboard-navigation.spec.ts");
  });
});
