import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  auditPosTerminalIconButtons,
} from "@/lib/pos/pos-terminal-icon-button-audit-policy";
import {
  extractAccessibleNameFromButtonSnippet,
  iconButtonSnippetHasAccessibleName,
  SCREEN_READER_ICON_BUTTON_CI_SCRIPTS,
  SCREEN_READER_ICON_BUTTON_POLICY_ID,
  SCREEN_READER_ICON_BUTTON_SPEC_PATH,
  SCREEN_READER_STATIC_ICON_BUTTON_COUNT,
  SCREEN_READER_STATIC_ICON_BUTTONS,
  screenReaderStaticButtonNames,
} from "@/lib/accessibility/screen-reader-icon-button-policy";

const ROOT = process.cwd();

describe("screen reader icon buttons (Absolute Final Task 48)", () => {
  it("locks five static and dynamic POS cart screen reader expectations", () => {
    expect(SCREEN_READER_ICON_BUTTON_POLICY_ID).toBe(
      "screen-reader-icon-button-absolute-final-v1",
    );
    expect(SCREEN_READER_STATIC_ICON_BUTTON_COUNT).toBe(5);
    expect(screenReaderStaticButtonNames()).toEqual([
      "Open navigation menu",
      "Open account menu",
      "Toggle theme",
      "Dismiss",
      "Close shortcuts",
    ]);
    expect(SCREEN_READER_STATIC_ICON_BUTTONS.map((row) => row.id)).toEqual([
      "dashboard_nav_menu",
      "dashboard_account_menu",
      "dashboard_theme_toggle",
      "pos_welcome_dismiss",
      "pos_shortcuts_close",
    ]);
  });

  it("extracts accessible names from aria-label and sr-only patterns", () => {
    expect(
      extractAccessibleNameFromButtonSnippet(
        '<Button size="icon" aria-label="Dismiss"><X /></Button>',
      ),
    ).toBe("Dismiss");
    expect(
      extractAccessibleNameFromButtonSnippet(
        '<Button size="icon"><span className="sr-only">Toggle theme</span></Button>',
      ),
    ).toBe("Toggle theme");
    expect(
      iconButtonSnippetHasAccessibleName('<Button size="icon" variant="ghost"><Minus /></Button>'),
    ).toBe(false);
    expect(
      iconButtonSnippetHasAccessibleName(
        '<Button size="icon" aria-label={posTerminalIncreaseQuantityLabel(line.title)} />',
      ),
    ).toBe(true);
  });

  it("POS icon-button fleet audit still passes before E2E screen reader sweep", () => {
    expect(auditPosTerminalIconButtons(ROOT).passed).toBe(true);
  });

  it("ships Playwright spec and npm scripts", () => {
    const spec = readFileSync(join(ROOT, SCREEN_READER_ICON_BUTTON_SPEC_PATH), "utf8");
    expect(spec).toContain("screen reader — icon-only buttons");
    expect(spec).toContain("getByRole(\"button\"");

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of SCREEN_READER_ICON_BUTTON_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }

    const playwrightConfig = readFileSync(join(ROOT, "playwright.config.ts"), "utf8");
    expect(playwrightConfig).toContain("screen-reader-icon-buttons.spec.ts");
  });
});
