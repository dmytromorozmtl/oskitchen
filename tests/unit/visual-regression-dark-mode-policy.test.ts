import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  VISUAL_REGRESSION_DARK_MODE_CI_SCRIPTS,
  VISUAL_REGRESSION_DARK_MODE_FIXTURE_PATH,
  VISUAL_REGRESSION_DARK_MODE_POLICY_ID,
  VISUAL_REGRESSION_DARK_MODE_SPEC_PATH,
  VISUAL_REGRESSION_DARK_MODE_TARGETS,
  VISUAL_REGRESSION_DARK_MODE_WORKFLOW_PATH,
  VISUAL_REGRESSION_THEME_MODES,
  visualRegressionDarkModePairCount,
  visualRegressionSnapshotName,
} from "@/lib/testing/visual-regression-dark-mode-policy";

const ROOT = process.cwd();

describe("visual regression dark mode parity (Absolute Final Task 51)", () => {
  it("locks light + dark snapshot pairs for visual-test fixtures", () => {
    expect(VISUAL_REGRESSION_DARK_MODE_POLICY_ID).toBe(
      "visual-regression-dark-mode-parity-absolute-final-v1",
    );
    expect(VISUAL_REGRESSION_THEME_MODES).toEqual(["light", "dark"]);
    expect(VISUAL_REGRESSION_DARK_MODE_TARGETS).toHaveLength(5);
    expect(visualRegressionDarkModePairCount()).toBe(10);
    expect(visualRegressionSnapshotName("theme-presets", "dark")).toBe(
      "theme-presets-dark.png",
    );
  });

  it("ships Playwright spec, theme helper, and dark-mode parity fixture", () => {
    const spec = readFileSync(join(ROOT, VISUAL_REGRESSION_DARK_MODE_SPEC_PATH), "utf8");
    expect(spec).toContain("visual: dark mode parity");
    expect(spec).toContain("assertVisualThemeApplied");

    const helper = readFileSync(join(ROOT, "tests/visual/helpers/dark-mode-theme.ts"), "utf8");
    expect(helper).toContain("localStorage.setItem");

    const fixture = readFileSync(join(ROOT, VISUAL_REGRESSION_DARK_MODE_FIXTURE_PATH), "utf8");
    expect(fixture).toContain("visual-dark-mode-parity");
    expect(fixture).toContain("ErrorState");
  });

  it("ships GHA workflow, PublicThemeLock bypass, and npm scripts", () => {
    const workflow = readFileSync(join(ROOT, VISUAL_REGRESSION_DARK_MODE_WORKFLOW_PATH), "utf8");
    expect(workflow).toContain("dark-mode-parity");
    expect(workflow).toContain("Visual regression");

    const themeLock = readFileSync(
      join(ROOT, "components/providers/public-theme-lock.tsx"),
      "utf8",
    );
    expect(themeLock).toContain("/visual-test");

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of VISUAL_REGRESSION_DARK_MODE_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
