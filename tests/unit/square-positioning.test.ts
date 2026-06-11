import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditSquarePositioning,
  formatSquarePositioningAuditLines,
} from "@/lib/marketing/square-positioning-audit";
import { SQUARE_POSITIONING_WEDGES } from "@/lib/marketing/square-positioning-content";
import {
  SQUARE_POSITIONING_AUDIT_SCRIPT,
  SQUARE_POSITIONING_CI_WORKFLOW,
  SQUARE_POSITIONING_DOC,
  SQUARE_POSITIONING_NPM_SCRIPT,
  SQUARE_POSITIONING_POLICY_ID,
  SQUARE_POSITIONING_PRIMARY_LINE,
  SQUARE_POSITIONING_SECTION_TEST_ID,
  SQUARE_POSITIONING_UNIT_TEST,
} from "@/lib/marketing/square-positioning-policy";

const ROOT = process.cwd();

describe("Square positioning (P1-75)", () => {
  it("locks policy id and canonical Square line", () => {
    expect(SQUARE_POSITIONING_POLICY_ID).toBe("square-positioning-p1-75-v1");
    expect(SQUARE_POSITIONING_PRIMARY_LINE).toBe(
      "Enterprise features without enterprise contracts.",
    );
    expect(SQUARE_POSITIONING_WEDGES).toHaveLength(3);
  });

  it("passes full Square positioning audit", () => {
    const summary = auditSquarePositioning(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.compareContentWired).toBe(true);
    expect(summary.sectionWired).toBe(true);
    expect(summary.compareLandingWired).toBe(true);
    expect(summary.pricingWired).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("ships Square positioning section with test id", () => {
    const source = readFileSync(
      join(ROOT, "components/marketing/square-positioning-section.tsx"),
      "utf8",
    );
    expect(source).toContain("SquarePositioningSection");
    expect(source).toContain("SQUARE_POSITIONING_SECTION_TEST_ID");
    expect(source).toContain("SQUARE_POSITIONING_PRIMARY_LINE");
    expect(SQUARE_POSITIONING_SECTION_TEST_ID).toBe("square-positioning-section");
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, SQUARE_POSITIONING_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, SQUARE_POSITIONING_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, SQUARE_POSITIONING_DOC))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SQUARE_POSITIONING_NPM_SCRIPT]).toContain(
      "audit-square-positioning.ts",
    );
    expect(pkg.scripts?.["test:ci:square-positioning"]).toContain(SQUARE_POSITIONING_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, SQUARE_POSITIONING_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:square-positioning");
  });

  it("formats audit lines", () => {
    const summary = auditSquarePositioning(ROOT);
    const lines = formatSquarePositioningAuditLines(summary);
    expect(lines.some((line) => line.includes(SQUARE_POSITIONING_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes(SQUARE_POSITIONING_SECTION_TEST_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
