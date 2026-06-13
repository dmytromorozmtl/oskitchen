import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditVisualRegressionDarkModeP3_58,
  formatVisualRegressionDarkModeP3_58AuditLines,
} from "@/lib/qa/visual-regression-dark-mode-p3-58-audit";
import {
  buildVisualRegressionTargetStatuses,
  validateVisualRegressionDarkModeContract,
} from "@/lib/qa/visual-regression-dark-mode-p3-58-measurement";
import {
  VISUAL_REGRESSION_DARK_MODE_P3_58_AUDIT_SCRIPT,
  VISUAL_REGRESSION_DARK_MODE_P3_58_CHECK_NPM_SCRIPT,
  VISUAL_REGRESSION_DARK_MODE_P3_58_DOC,
  VISUAL_REGRESSION_DARK_MODE_P3_58_NPM_SCRIPT,
  VISUAL_REGRESSION_DARK_MODE_P3_58_NPM_SCRIPTS,
  VISUAL_REGRESSION_DARK_MODE_P3_58_POLICY_ID,
  VISUAL_REGRESSION_DARK_MODE_P3_58_SNAPSHOT_PAIR_COUNT,
  VISUAL_REGRESSION_DARK_MODE_P3_58_TARGET_COUNT,
  VISUAL_REGRESSION_DARK_MODE_P3_58_THEME_MODES,
  VISUAL_REGRESSION_DARK_MODE_P3_58_UNIT_TEST,
  isVisualRegressionDarkModeP3_58Enabled,
  visualRegressionDarkModeTargetIds,
} from "@/lib/qa/visual-regression-dark-mode-p3-58-policy";

const ROOT = process.cwd();

describe("Visual regression dark mode (P3-58)", () => {
  it("locks policy id and five-target light/dark matrix", () => {
    expect(VISUAL_REGRESSION_DARK_MODE_P3_58_POLICY_ID).toBe(
      "visual-regression-dark-mode-p3-58-v1",
    );
    expect(visualRegressionDarkModeTargetIds()).toHaveLength(
      VISUAL_REGRESSION_DARK_MODE_P3_58_TARGET_COUNT,
    );
    expect(VISUAL_REGRESSION_DARK_MODE_P3_58_THEME_MODES).toEqual(["light", "dark"]);
    expect(VISUAL_REGRESSION_DARK_MODE_P3_58_SNAPSHOT_PAIR_COUNT).toBe(10);
  });

  it("validates visual regression dark mode contract", () => {
    const validation = validateVisualRegressionDarkModeContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.targetCount).toBe(5);
    expect(validation.snapshotPairCount).toBe(10);
    expect(
      buildVisualRegressionTargetStatuses(ROOT).every((status) => status.fixturePresent),
    ).toBe(true);
  });

  it("passes full visual regression dark mode audit", () => {
    const summary = auditVisualRegressionDarkModeP3_58(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.specWired).toBe(true);
    expect(summary.flowWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.fiveTargetsPresent).toBe(true);
    expect(summary.tenSnapshotPairs).toBe(true);
    expect(summary.chromaticWorkflowWired).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatVisualRegressionDarkModeP3_58AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, VISUAL_REGRESSION_DARK_MODE_P3_58_DOC))).toBe(true);
    expect(existsSync(join(ROOT, VISUAL_REGRESSION_DARK_MODE_P3_58_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, VISUAL_REGRESSION_DARK_MODE_P3_58_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[VISUAL_REGRESSION_DARK_MODE_P3_58_NPM_SCRIPT]).toContain(
      "audit-visual-regression-dark-mode-p3-58.ts",
    );
    expect(pkg.scripts?.[VISUAL_REGRESSION_DARK_MODE_P3_58_CHECK_NPM_SCRIPT]).toContain(
      VISUAL_REGRESSION_DARK_MODE_P3_58_UNIT_TEST,
    );
    for (const script of VISUAL_REGRESSION_DARK_MODE_P3_58_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });

  it("E2E gate requires E2E_VISUAL_REGRESSION_DARK_MODE flag", () => {
    const original = process.env.E2E_VISUAL_REGRESSION_DARK_MODE;
    delete process.env.E2E_VISUAL_REGRESSION_DARK_MODE;
    expect(isVisualRegressionDarkModeP3_58Enabled()).toBe(false);
    process.env.E2E_VISUAL_REGRESSION_DARK_MODE = "true";
    expect(isVisualRegressionDarkModeP3_58Enabled()).toBe(true);
    if (original !== undefined) process.env.E2E_VISUAL_REGRESSION_DARK_MODE = original;
    else delete process.env.E2E_VISUAL_REGRESSION_DARK_MODE;
  });
});
