import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditSkeletonDesignSystem,
  formatSkeletonDesignSystemAuditLines,
} from "@/lib/design/skeleton-design-system-audit";
import {
  SKELETON_DESIGN_SYSTEM_AUDIT_SCRIPT,
  SKELETON_DESIGN_SYSTEM_CI_WORKFLOW,
  SKELETON_DESIGN_SYSTEM_DEFAULTS,
  SKELETON_DESIGN_SYSTEM_MODULE,
  SKELETON_DESIGN_SYSTEM_NPM_SCRIPT,
  SKELETON_DESIGN_SYSTEM_POLICY_ID,
  SKELETON_DESIGN_SYSTEM_PRIMITIVES,
  SKELETON_DESIGN_SYSTEM_TEST_IDS,
  SKELETON_DESIGN_SYSTEM_UNIT_TEST,
} from "@/lib/design/skeleton-design-system-policy";

const ROOT = process.cwd();

describe("skeleton design system (P1-58)", () => {
  it("locks policy id and four primitives", () => {
    expect(SKELETON_DESIGN_SYSTEM_POLICY_ID).toBe("skeleton-design-system-p1-58-v1");
    expect(SKELETON_DESIGN_SYSTEM_PRIMITIVES).toEqual([
      "TableSkeleton",
      "CardGridSkeleton",
      "KPISkeleton",
      "ChartSkeleton",
    ]);
    expect(SKELETON_DESIGN_SYSTEM_DEFAULTS.kpiCount).toBe(4);
  });

  it("ships skeleton primitives with test ids and design tokens", () => {
    const source = readFileSync(join(ROOT, SKELETON_DESIGN_SYSTEM_MODULE), "utf8");
    for (const primitive of SKELETON_DESIGN_SYSTEM_PRIMITIVES) {
      expect(source).toMatch(new RegExp(primitive));
    }
    expect(source).toContain("SKELETON_DESIGN_SYSTEM_TEST_IDS");
    expect(source).toContain("SKELETON_SURFACE_CLASS");
    expect(source).toContain("LoadingSkeleton");
    expect(source).toContain('export { TableSkeleton }');
  });

  it("passes full skeleton design system audit", () => {
    const summary = auditSkeletonDesignSystem(ROOT);
    expect(summary.modulePresent).toBe(true);
    expect(summary.primitivesWired).toEqual([...SKELETON_DESIGN_SYSTEM_PRIMITIVES]);
    expect(summary.missingPrimitives).toEqual([]);
    expect(summary.usesDesignTokens).toBe(true);
    expect(summary.tableReExportWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, SKELETON_DESIGN_SYSTEM_MODULE))).toBe(true);
    expect(existsSync(join(ROOT, SKELETON_DESIGN_SYSTEM_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, SKELETON_DESIGN_SYSTEM_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SKELETON_DESIGN_SYSTEM_NPM_SCRIPT]).toContain(
      "audit-skeleton-design-system.ts",
    );
    expect(pkg.scripts?.["test:ci:skeleton-design-system"]).toContain(
      SKELETON_DESIGN_SYSTEM_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, SKELETON_DESIGN_SYSTEM_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:skeleton-design-system");
  });

  it("formats audit lines", () => {
    const summary = auditSkeletonDesignSystem(ROOT);
    const lines = formatSkeletonDesignSystemAuditLines(summary);
    expect(lines.some((line) => line.includes(SKELETON_DESIGN_SYSTEM_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
