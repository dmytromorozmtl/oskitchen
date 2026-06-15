import { describe, expect, it } from "vitest";

import {
  matchPosShortcut,
  POS_SHORTCUTS,
  quickAddIndexFromAction,
} from "@/lib/keyboard/shortcuts";
import {
  POS_CUSTOMER_DISPLAY_CHANNEL,
  resolveCustomerDisplayWindowFeatures,
  screenLooksExtended,
} from "@/lib/pos/pos-multi-monitor";
import {
  POS_CUSTOMER_DISPLAY_ROUTE,
  POS_DESKTOP_SHORTCUTS_POLICY_ID,
  POS_DESKTOP_TERMINAL_ROUTE,
} from "@/lib/pos/pos-desktop-shortcuts-policy";

describe("desktop POS shortcuts", () => {
  it("locks policy constants", () => {
    expect(POS_DESKTOP_SHORTCUTS_POLICY_ID).toBe("pos-desktop-shortcuts-v1");
    expect(POS_DESKTOP_TERMINAL_ROUTE).toBe("/dashboard/pos/terminal");
    expect(POS_CUSTOMER_DISPLAY_ROUTE).toBe("/dashboard/pos/terminal/customer-display");
    expect(POS_CUSTOMER_DISPLAY_CHANNEL).toBe("kitchenos-pos-customer-display-v1");
  });

  it("ships expanded function-key shortcuts", () => {
    const keys = POS_SHORTCUTS.map((shortcut) => shortcut.key);
    expect(keys).toContain("F5");
    expect(keys).toContain("F8");
    expect(keys).toContain("F9");
    expect(keys).toContain("?");
  });

  it("maps quick-add number keys when not typing in an input", () => {
    const target = { tagName: "DIV", isContentEditable: false };
    const event = {
      key: "3",
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target,
      preventDefault: () => undefined,
    } as unknown as KeyboardEvent;
    expect(matchPosShortcut(event)).toBe("quick_add_3");
    expect(quickAddIndexFromAction("quick_add_3")).toBe(3);
  });

  it("ignores number shortcuts while focused on inputs", () => {
    const target = { tagName: "INPUT", isContentEditable: false };
    const event = {
      key: "3",
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target,
      preventDefault: () => undefined,
    } as unknown as KeyboardEvent;
    expect(matchPosShortcut(event)).toBeNull();
  });

  it("places customer display popup on extended screen edge", () => {
    const screen = {
      availWidth: 3840,
      availHeight: 1080,
      width: 3840,
      isExtended: true,
    } as Screen;
    expect(screenLooksExtended(screen)).toBe(true);
    expect(resolveCustomerDisplayWindowFeatures(screen)).toContain("left=3840");
  });
});
