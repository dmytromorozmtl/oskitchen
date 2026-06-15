import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditBusFactorP3_134,
  formatBusFactorP3_134AuditLines,
} from "@/lib/pm/bus-factor-p3-134-audit";
import {
  loadBusFactorP3_134Registry,
  loadEmergencyAccessChecklist,
  validateBusFactorP3_134Registry,
  validateEmergencyAccessChecklist,
} from "@/lib/pm/bus-factor-p3-134-operations";
import {
  BUS_FACTOR_P3_134_ADR_FILES,
  BUS_FACTOR_P3_134_ADR_TARGET,
  BUS_FACTOR_P3_134_CI_WORKFLOW,
  BUS_FACTOR_P3_134_DOC,
  BUS_FACTOR_P3_134_NPM_SCRIPT,
  BUS_FACTOR_P3_134_POLICY_ID,
  BUS_FACTOR_P3_134_UNIT_TEST,
  BUS_FACTOR_P3_134_VIDEO_TARGET,
} from "@/lib/pm/bus-factor-p3-134-policy";

const ROOT = process.cwd();

describe("Bus factor mitigation PM (P3-134)", () => {
  it("locks policy id and 10 ADR + 10 video targets", () => {
    expect(BUS_FACTOR_P3_134_POLICY_ID).toBe("bus-factor-p3-134-v1");
    expect(BUS_FACTOR_P3_134_ADR_TARGET).toBe(10);
    expect(BUS_FACTOR_P3_134_VIDEO_TARGET).toBe(10);
    expect(BUS_FACTOR_P3_134_ADR_FILES).toHaveLength(10);
  });

  it("validates registry with 10 script_ready videos and 0 recorded", () => {
    const registry = loadBusFactorP3_134Registry(ROOT);
    const validation = validateBusFactorP3_134Registry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.zeroRecorded).toBe(true);
    expect(registry.adrVideoRecorded).toBe(0);
  });

  it("validates emergency access checklist with 9 pending systems", () => {
    const checklist = loadEmergencyAccessChecklist(ROOT);
    const validation = validateEmergencyAccessChecklist(checklist);
    expect(validation.valid).toBe(true);
    expect(validation.allPending).toBe(true);
    expect(checklist.systems).toHaveLength(9);
  });

  it("passes full bus factor PM audit", () => {
    const summary = auditBusFactorP3_134(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.videoCatalogWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.emergencyChecklistValid).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, BUS_FACTOR_P3_134_DOC))).toBe(true);
    expect(existsSync(join(ROOT, BUS_FACTOR_P3_134_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[BUS_FACTOR_P3_134_NPM_SCRIPT]).toContain("audit-bus-factor-p3-134.ts");
    expect(pkg.scripts?.["test:ci:bus-factor-p3-134"]).toContain(BUS_FACTOR_P3_134_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, BUS_FACTOR_P3_134_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:bus-factor-p3-134");
  });

  it("formats audit lines", () => {
    const summary = auditBusFactorP3_134(ROOT);
    const lines = formatBusFactorP3_134AuditLines(summary);
    expect(lines.some((line) => line.includes(BUS_FACTOR_P3_134_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
