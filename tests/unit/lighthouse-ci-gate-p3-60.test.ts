import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditLighthouseCiGateP3_60,
  formatLighthouseCiGateP3_60AuditLines,
} from "@/lib/qa/lighthouse-ci-gate-p3-60-audit";
import {
  evaluateLighthouseCiGateMetrics,
  validateLighthouseCiGateContract,
} from "@/lib/qa/lighthouse-ci-gate-p3-60-measurement";
import {
  isLighthouseCiGateP3_60Enabled,
  LIGHTHOUSE_CI_GATE_P3_60_AUDIT_SCRIPT,
  LIGHTHOUSE_CI_GATE_P3_60_CHECK_NPM_SCRIPT,
  LIGHTHOUSE_CI_GATE_P3_60_CLS_MAX,
  LIGHTHOUSE_CI_GATE_P3_60_DOC,
  LIGHTHOUSE_CI_GATE_P3_60_FCP_MAX_MS,
  LIGHTHOUSE_CI_GATE_P3_60_LCP_MAX_MS,
  LIGHTHOUSE_CI_GATE_P3_60_NPM_SCRIPT,
  LIGHTHOUSE_CI_GATE_P3_60_NPM_SCRIPTS,
  LIGHTHOUSE_CI_GATE_P3_60_POLICY_ID,
  LIGHTHOUSE_CI_GATE_P3_60_UNIT_TEST,
} from "@/lib/qa/lighthouse-ci-gate-p3-60-policy";

const ROOT = process.cwd();

describe("Lighthouse CI gate (P3-60)", () => {
  it("locks policy id and Core Web Vitals thresholds", () => {
    expect(LIGHTHOUSE_CI_GATE_P3_60_POLICY_ID).toBe("lighthouse-ci-gate-p3-60-v1");
    expect(LIGHTHOUSE_CI_GATE_P3_60_FCP_MAX_MS).toBe(2000);
    expect(LIGHTHOUSE_CI_GATE_P3_60_LCP_MAX_MS).toBe(3500);
    expect(LIGHTHOUSE_CI_GATE_P3_60_CLS_MAX).toBe(0.1);
  });

  it("validates lighthouse CI gate contract", () => {
    const validation = validateLighthouseCiGateContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.pathCount).toBe(4);
  });

  it("evaluates passing and failing metric bundles", () => {
    expect(evaluateLighthouseCiGateMetrics({ fcpMs: 1800, lcpMs: 3200, cls: 0.05 }).passed).toBe(
      true,
    );
    expect(
      evaluateLighthouseCiGateMetrics({ fcpMs: 2100, lcpMs: 3600, cls: 0.12 }).passed,
    ).toBe(false);
  });

  it("passes full lighthouse CI gate audit", () => {
    const summary = auditLighthouseCiGateP3_60(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.specWired).toBe(true);
    expect(summary.flowWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.fcpGate2s).toBe(true);
    expect(summary.lcpGate3_5s).toBe(true);
    expect(summary.clsGate0_1).toBe(true);
    expect(summary.lighthouseWorkflowWired).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatLighthouseCiGateP3_60AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, LIGHTHOUSE_CI_GATE_P3_60_DOC))).toBe(true);
    expect(existsSync(join(ROOT, LIGHTHOUSE_CI_GATE_P3_60_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, LIGHTHOUSE_CI_GATE_P3_60_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[LIGHTHOUSE_CI_GATE_P3_60_NPM_SCRIPT]).toContain(
      "audit-lighthouse-ci-gate-p3-60.ts",
    );
    expect(pkg.scripts?.[LIGHTHOUSE_CI_GATE_P3_60_CHECK_NPM_SCRIPT]).toContain(
      LIGHTHOUSE_CI_GATE_P3_60_UNIT_TEST,
    );
    for (const script of LIGHTHOUSE_CI_GATE_P3_60_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });

  it("E2E gate requires E2E_LIGHTHOUSE_CI_GATE flag", () => {
    const original = process.env.E2E_LIGHTHOUSE_CI_GATE;
    delete process.env.E2E_LIGHTHOUSE_CI_GATE;
    expect(isLighthouseCiGateP3_60Enabled()).toBe(false);
    process.env.E2E_LIGHTHOUSE_CI_GATE = "true";
    expect(isLighthouseCiGateP3_60Enabled()).toBe(true);
    if (original !== undefined) process.env.E2E_LIGHTHOUSE_CI_GATE = original;
    else delete process.env.E2E_LIGHTHOUSE_CI_GATE;
  });
});
