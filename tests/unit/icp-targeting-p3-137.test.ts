import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditIcpTargetingP3_137,
  formatIcpTargetingP3_137AuditLines,
} from "@/lib/pm/icp-targeting-p3-137-audit";
import {
  loadIcpTargetingPmRegistry,
  validateIcpTargetingPmRegistry,
} from "@/lib/pm/icp-targeting-p3-137-operations";
import {
  ICP_TARGETING_P3_137_CI_WORKFLOW,
  ICP_TARGETING_P3_137_DOC,
  ICP_TARGETING_P3_137_ICP_SCORE_TARGET,
  ICP_TARGETING_P3_137_NPM_SCRIPT,
  ICP_TARGETING_P3_137_POLICY_ID,
  ICP_TARGETING_P3_137_PROFILE_IDS,
  ICP_TARGETING_P3_137_UNIT_TEST,
  ICP_TARGETING_P3_137_WAVE1_ORDER,
} from "@/lib/pm/icp-targeting-p3-137-policy";

const ROOT = process.cwd();

describe("ICP targeting PM (P3-137)", () => {
  it("locks policy id and two Wave 1 profiles", () => {
    expect(ICP_TARGETING_P3_137_POLICY_ID).toBe("icp-targeting-p3-137-v1");
    expect(ICP_TARGETING_P3_137_PROFILE_IDS).toEqual(["meal_prep", "ghost_kitchen"]);
    expect(ICP_TARGETING_P3_137_WAVE1_ORDER).toEqual(["meal_prep", "ghost_kitchen"]);
    expect(ICP_TARGETING_P3_137_ICP_SCORE_TARGET).toBe(8);
  });

  it("validates registry with zero qualified prospects", () => {
    const registry = loadIcpTargetingPmRegistry(ROOT);
    const validation = validateIcpTargetingPmRegistry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.zeroQualified).toBe(true);
    expect(registry.qualifiedProspectCount).toBe(0);
    expect(registry.profiles).toHaveLength(2);
  });

  it("passes full ICP targeting PM audit", () => {
    const summary = auditIcpTargetingP3_137(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.liveLandingPagesPassed).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.profilesDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, ICP_TARGETING_P3_137_DOC))).toBe(true);
    expect(existsSync(join(ROOT, ICP_TARGETING_P3_137_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[ICP_TARGETING_P3_137_NPM_SCRIPT]).toContain(
      "audit-icp-targeting-p3-137.ts",
    );
    expect(pkg.scripts?.["test:ci:icp-targeting-p3-137"]).toContain(
      ICP_TARGETING_P3_137_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, ICP_TARGETING_P3_137_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:icp-targeting-p3-137");
  });

  it("formats audit lines", () => {
    const summary = auditIcpTargetingP3_137(ROOT);
    const lines = formatIcpTargetingP3_137AuditLines(summary);
    expect(lines.some((line) => line.includes(ICP_TARGETING_P3_137_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
