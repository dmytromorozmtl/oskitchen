import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditMarginedgePositioning,
  formatMarginedgePositioningAuditLines,
} from "@/lib/marketing/marginedge-positioning-audit";
import { MARGINEDGE_POSITIONING_WEDGES } from "@/lib/marketing/marginedge-positioning-content";
import {
  MARGINEDGE_POSITIONING_AUDIT_SCRIPT,
  MARGINEDGE_POSITIONING_CI_WORKFLOW,
  MARGINEDGE_POSITIONING_DOC,
  MARGINEDGE_POSITIONING_NPM_SCRIPT,
  MARGINEDGE_POSITIONING_POLICY_ID,
  MARGINEDGE_POSITIONING_PRIMARY_LINE,
  MARGINEDGE_POSITIONING_SECTION_TEST_ID,
  MARGINEDGE_POSITIONING_UNIT_TEST,
} from "@/lib/marketing/marginedge-positioning-policy";

const ROOT = process.cwd();

describe("MarginEdge positioning (P1-78)", () => {
  it("locks policy id and canonical MarginEdge line", () => {
    expect(MARGINEDGE_POSITIONING_POLICY_ID).toBe("marginedge-positioning-p1-78-v1");
    expect(MARGINEDGE_POSITIONING_PRIMARY_LINE).toBe(
      "Invoice AI is a feature, not a product.",
    );
    expect(MARGINEDGE_POSITIONING_WEDGES).toHaveLength(3);
  });

  it("passes full MarginEdge positioning audit", () => {
    const summary = auditMarginedgePositioning(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.compareContentWired).toBe(true);
    expect(summary.sectionWired).toBe(true);
    expect(summary.compareLandingWired).toBe(true);
    expect(summary.pricingWired).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("ships MarginEdge positioning section with test id", () => {
    const source = readFileSync(
      join(ROOT, "components/marketing/marginedge-positioning-section.tsx"),
      "utf8",
    );
    expect(source).toContain("MarginedgePositioningSection");
    expect(source).toContain("MARGINEDGE_POSITIONING_SECTION_TEST_ID");
    expect(source).toContain("MARGINEDGE_POSITIONING_PRIMARY_LINE");
    expect(MARGINEDGE_POSITIONING_SECTION_TEST_ID).toBe("marginedge-positioning-section");
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, MARGINEDGE_POSITIONING_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, MARGINEDGE_POSITIONING_DOC))).toBe(true);
    expect(existsSync(join(ROOT, MARGINEDGE_POSITIONING_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[MARGINEDGE_POSITIONING_NPM_SCRIPT]).toContain(
      "audit-marginedge-positioning.ts",
    );
    expect(pkg.scripts?.["test:ci:marginedge-positioning"]).toContain(
      MARGINEDGE_POSITIONING_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, MARGINEDGE_POSITIONING_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:marginedge-positioning");
  });

  it("formats audit lines", () => {
    const summary = auditMarginedgePositioning(ROOT);
    const lines = formatMarginedgePositioningAuditLines(summary);
    expect(lines.some((line) => line.includes(MARGINEDGE_POSITIONING_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes(MARGINEDGE_POSITIONING_SECTION_TEST_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
