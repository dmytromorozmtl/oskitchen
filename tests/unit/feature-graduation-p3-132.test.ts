import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditFeatureGraduation,
  formatFeatureGraduationAuditLines,
} from "@/lib/pm/feature-graduation-p3-132-audit";
import {
  countFeatureGraduation,
  loadFeatureGraduationRegistry,
  validateFeatureGraduationRegistry,
} from "@/lib/pm/feature-graduation-p3-132-operations";
import {
  FEATURE_GRADUATION_CI_WORKFLOW,
  FEATURE_GRADUATION_DOC,
  FEATURE_GRADUATION_FEATURE_IDS,
  FEATURE_GRADUATION_GATES,
  FEATURE_GRADUATION_NPM_SCRIPT,
  FEATURE_GRADUATION_POLICY_ID,
  FEATURE_GRADUATION_UNIT_TEST,
} from "@/lib/pm/feature-graduation-p3-132-policy";

const ROOT = process.cwd();

describe("Feature graduation criteria (P3-132)", () => {
  it("locks policy id and three graduation gates", () => {
    expect(FEATURE_GRADUATION_POLICY_ID).toBe("feature-graduation-p3-132-v1");
    expect(FEATURE_GRADUATION_GATES).toHaveLength(3);
    expect(FEATURE_GRADUATION_GATES.map((gate) => gate.id)).toEqual([
      "accuracy_benchmark",
      "e2e_pass",
      "merchant_proof",
    ]);
  });

  it("validates registry with nine feature slots and zero graduated", () => {
    const registry = loadFeatureGraduationRegistry(ROOT);
    const validation = validateFeatureGraduationRegistry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.zeroGraduated).toBe(true);
    expect(FEATURE_GRADUATION_FEATURE_IDS).toHaveLength(9);

    const counts = countFeatureGraduation(registry);
    expect(counts.featureCount).toBe(9);
    expect(counts.gateCount).toBe(3);
    expect(counts.graduatedCount).toBe(0);
    expect(counts.pendingGateCount).toBeGreaterThan(0);
  });

  it("passes full feature graduation audit", () => {
    const summary = auditFeatureGraduation(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.gatesDocumented).toBe(true);
    expect(summary.featuresDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, FEATURE_GRADUATION_DOC))).toBe(true);
    expect(existsSync(join(ROOT, FEATURE_GRADUATION_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[FEATURE_GRADUATION_NPM_SCRIPT]).toContain(
      "audit-feature-graduation-p3-132.ts",
    );
    expect(pkg.scripts?.["test:ci:feature-graduation-p3-132"]).toContain(
      FEATURE_GRADUATION_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, FEATURE_GRADUATION_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:feature-graduation-p3-132");
  });

  it("formats audit lines", () => {
    const summary = auditFeatureGraduation(ROOT);
    const lines = formatFeatureGraduationAuditLines(summary);
    expect(lines.some((line) => line.includes(FEATURE_GRADUATION_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
