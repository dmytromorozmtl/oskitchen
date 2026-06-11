import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPositioningReformulation,
  formatPositioningReformulationAuditLines,
} from "@/lib/marketing/positioning-reformulation-audit";
import {
  POSITIONING_REFORMULATION_AUDIT_SCRIPT,
  POSITIONING_REFORMULATION_CI_WORKFLOW,
  POSITIONING_REFORMULATION_DOC,
  POSITIONING_REFORMULATION_NPM_SCRIPT,
  POSITIONING_REFORMULATION_POLICY_ID,
  POSITIONING_REFORMULATION_PRIMARY_LINE,
  POSITIONING_REFORMULATION_STRIP_TEST_ID,
  POSITIONING_REFORMULATION_SUPPORTING_PILLARS,
  POSITIONING_REFORMULATION_UNIT_TEST,
} from "@/lib/marketing/positioning-reformulation-policy";

const ROOT = process.cwd();

describe("Positioning reformulation (P1-72)", () => {
  it("locks policy id and canonical positioning line", () => {
    expect(POSITIONING_REFORMULATION_POLICY_ID).toBe("positioning-reformulation-p1-72-v1");
    expect(POSITIONING_REFORMULATION_PRIMARY_LINE).toBe(
      "Built for operators who need more than Square but can't afford Toast's hardware lock-in.",
    );
    expect(POSITIONING_REFORMULATION_SUPPORTING_PILLARS).toHaveLength(3);
  });

  it("passes full positioning reformulation audit", () => {
    const summary = auditPositioningReformulation(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.legacyDocWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.homeLandingWired).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("ships positioning strip component with test id", () => {
    const source = readFileSync(
      join(ROOT, "components/marketing/positioning-reformulation-strip.tsx"),
      "utf8",
    );
    expect(source).toContain("PositioningReformulationStrip");
    expect(source).toContain("POSITIONING_REFORMULATION_STRIP_TEST_ID");
    expect(source).toContain("POSITIONING_REFORMULATION_PRIMARY_LINE");
    expect(POSITIONING_REFORMULATION_STRIP_TEST_ID).toBe("positioning-reformulation-strip");
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, POSITIONING_REFORMULATION_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, POSITIONING_REFORMULATION_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, POSITIONING_REFORMULATION_DOC))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[POSITIONING_REFORMULATION_NPM_SCRIPT]).toContain(
      "audit-positioning-reformulation.ts",
    );
    expect(pkg.scripts?.["test:ci:positioning-reformulation"]).toContain(
      POSITIONING_REFORMULATION_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, POSITIONING_REFORMULATION_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:positioning-reformulation");
  });

  it("formats audit lines", () => {
    const summary = auditPositioningReformulation(ROOT);
    const lines = formatPositioningReformulationAuditLines(summary);
    expect(lines.some((line) => line.includes(POSITIONING_REFORMULATION_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes(POSITIONING_REFORMULATION_STRIP_TEST_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
