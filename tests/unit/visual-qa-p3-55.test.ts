import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditVisualQaP3_55,
  formatVisualQaP3_55AuditLines,
} from "@/lib/qa/visual-qa-p3-55-audit";
import {
  buildVisualQaSurfaceStatuses,
  validateVisualQaContract,
} from "@/lib/qa/visual-qa-p3-55-measurement";
import {
  VISUAL_QA_P3_55_AUDIT_SCRIPT,
  VISUAL_QA_P3_55_CHECK_NPM_SCRIPT,
  VISUAL_QA_P3_55_CI_WORKFLOW,
  VISUAL_QA_P3_55_DOC,
  VISUAL_QA_P3_55_FLOW_STEPS,
  VISUAL_QA_P3_55_NPM_SCRIPT,
  VISUAL_QA_P3_55_POLICY_ID,
  VISUAL_QA_P3_55_SPEC,
  VISUAL_QA_P3_55_SURFACE_COUNT,
  VISUAL_QA_P3_55_UNIT_TEST,
  VISUAL_QA_P3_55_VISUAL_NPM_SCRIPT,
  VISUAL_QA_P3_55_VISUAL_SPEC,
  isVisualQaP3_55Enabled,
  visualQaSurfaceIds,
} from "@/lib/qa/visual-qa-p3-55-policy";

const ROOT = process.cwd();

describe("Visual QA (P3-55)", () => {
  it("locks policy id and three-surface matrix", () => {
    expect(VISUAL_QA_P3_55_POLICY_ID).toBe("visual-qa-p3-55-v1");
    expect(visualQaSurfaceIds()).toHaveLength(VISUAL_QA_P3_55_SURFACE_COUNT);
    expect(VISUAL_QA_P3_55_FLOW_STEPS).toHaveLength(4);
    expect(visualQaSurfaceIds()).toEqual(["pos_tablet", "kds_kitchen", "mobile_today"]);
  });

  it("validates visual QA contract", () => {
    const validation = validateVisualQaContract(ROOT);
    expect(validation.passed).toBe(true);
    expect(validation.surfaceCount).toBe(3);
    expect(buildVisualQaSurfaceStatuses(ROOT).every((s) => s.fixturePresent && s.shellPresent)).toBe(
      true,
    );
  });

  it("passes full visual QA audit", () => {
    const summary = auditVisualQaP3_55(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.specWired).toBe(true);
    expect(summary.visualSpecWired).toBe(true);
    expect(summary.flowWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.threeSurfacesPresent).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatVisualQaP3_55AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, VISUAL_QA_P3_55_DOC))).toBe(true);
    expect(existsSync(join(ROOT, VISUAL_QA_P3_55_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, VISUAL_QA_P3_55_VISUAL_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, VISUAL_QA_P3_55_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, VISUAL_QA_P3_55_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[VISUAL_QA_P3_55_NPM_SCRIPT]).toContain("audit-visual-qa-p3-55.ts");
    expect(pkg.scripts?.[VISUAL_QA_P3_55_CHECK_NPM_SCRIPT]).toContain(VISUAL_QA_P3_55_UNIT_TEST);
    expect(pkg.scripts?.[VISUAL_QA_P3_55_VISUAL_NPM_SCRIPT]).toContain("visual-qa-p3-55");

    const workflow = readFileSync(join(ROOT, VISUAL_QA_P3_55_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("visual-qa-p3-55");
  });

  it("E2E gate requires E2E_VISUAL_QA_P3_55 flag", () => {
    const original = process.env.E2E_VISUAL_QA_P3_55;
    delete process.env.E2E_VISUAL_QA_P3_55;
    expect(isVisualQaP3_55Enabled()).toBe(false);
    process.env.E2E_VISUAL_QA_P3_55 = "true";
    expect(isVisualQaP3_55Enabled()).toBe(true);
    if (original !== undefined) process.env.E2E_VISUAL_QA_P3_55 = original;
    else delete process.env.E2E_VISUAL_QA_P3_55;
  });
});
