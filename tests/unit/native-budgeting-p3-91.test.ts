import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditNativeBudgetingP391,
  formatNativeBudgetingP391AuditLines,
} from "@/lib/finance/native-budgeting-p3-91-audit";
import {
  nativeBudgetingMeetsMinCategories,
  nativeBudgetingPrimeCostTarget,
  NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES,
} from "@/lib/finance/native-budgeting-p3-91-content";
import { buildNativeBudgetTargets } from "@/lib/finance/native-budgeting-builders";
import { DEFAULT_NATIVE_BUDGET_SETTINGS } from "@/lib/finance/native-budgeting-settings";
import {
  NATIVE_BUDGETING_P3_91_ARTIFACT,
  NATIVE_BUDGETING_P3_91_CANONICAL_PATH,
  NATIVE_BUDGETING_P3_91_CHECK_NPM_SCRIPT,
  NATIVE_BUDGETING_P3_91_CI_WORKFLOW,
  NATIVE_BUDGETING_P3_91_DOC,
  NATIVE_BUDGETING_P3_91_MIN_CATEGORIES,
  NATIVE_BUDGETING_P3_91_POLICY_ID,
  NATIVE_BUDGETING_P3_91_UNIT_TEST,
  NATIVE_BUDGETING_P3_91_WIRING_PATHS,
} from "@/lib/finance/native-budgeting-p3-91-policy";

const ROOT = process.cwd();

describe("Native budgeting module (P3-91)", () => {
  it("locks policy with 8+ categories and 60% prime cost default", () => {
    expect(NATIVE_BUDGETING_P3_91_POLICY_ID).toBe("native-budgeting-p3-91-v1");
    expect(NATIVE_BUDGETING_P3_91_CANONICAL_PATH).toBe("/dashboard/finance/budget");
    expect(NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES.length).toBeGreaterThanOrEqual(
      NATIVE_BUDGETING_P3_91_MIN_CATEGORIES,
    );
    expect(nativeBudgetingMeetsMinCategories()).toBe(true);
    expect(nativeBudgetingPrimeCostTarget()).toBe(0.6);
  });

  it("builds budget targets from revenue and operator settings", () => {
    const targets = buildNativeBudgetTargets(100_000, {
      ...DEFAULT_NATIVE_BUDGET_SETTINGS,
      categoryOverrides: { food_cost: 0.28 },
    });
    expect(targets.food_cost).toBe(28_000);
    expect(targets.labor).toBe(30_000);
  });

  it("passes full P3-91 native budgeting audit", () => {
    const summary = auditNativeBudgetingP391(ROOT);
    expect(summary.categoriesOk, summary.failures.join("; ")).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.pnlIntegrated).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-91 wiring paths, CI gate, and artifact", () => {
    for (const path of NATIVE_BUDGETING_P3_91_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[NATIVE_BUDGETING_P3_91_CHECK_NPM_SCRIPT]).toContain(
      NATIVE_BUDGETING_P3_91_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, NATIVE_BUDGETING_P3_91_CI_WORKFLOW), "utf8");
    expect(ci).toContain(NATIVE_BUDGETING_P3_91_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(readFileSync(join(ROOT, NATIVE_BUDGETING_P3_91_ARTIFACT), "utf8"));
    expect(artifact.policyId).toBe(NATIVE_BUDGETING_P3_91_POLICY_ID);
    expect(artifact.accountantRequired).toBe(false);

    const doc = readFileSync(join(ROOT, NATIVE_BUDGETING_P3_91_DOC), "utf8");
    expect(doc).toContain(NATIVE_BUDGETING_P3_91_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditNativeBudgetingP391(ROOT);
    const lines = formatNativeBudgetingP391AuditLines(summary);
    expect(lines.some((line) => line.includes(NATIVE_BUDGETING_P3_91_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
