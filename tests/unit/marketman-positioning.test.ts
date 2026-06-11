import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditMarketmanPositioning,
  formatMarketmanPositioningAuditLines,
} from "@/lib/marketing/marketman-positioning-audit";
import { MARKETMAN_POSITIONING_WEDGES } from "@/lib/marketing/marketman-positioning-content";
import {
  MARKETMAN_POSITIONING_AUDIT_SCRIPT,
  MARKETMAN_POSITIONING_CI_WORKFLOW,
  MARKETMAN_POSITIONING_DOC,
  MARKETMAN_POSITIONING_NPM_SCRIPT,
  MARKETMAN_POSITIONING_POLICY_ID,
  MARKETMAN_POSITIONING_PRIMARY_LINE,
  MARKETMAN_POSITIONING_SECTION_TEST_ID,
  MARKETMAN_POSITIONING_UNIT_TEST,
} from "@/lib/marketing/marketman-positioning-policy";

const ROOT = process.cwd();

describe("MarketMan positioning (P1-77)", () => {
  it("locks policy id and canonical MarketMan line", () => {
    expect(MARKETMAN_POSITIONING_POLICY_ID).toBe("marketman-positioning-p1-77-v1");
    expect(MARKETMAN_POSITIONING_PRIMARY_LINE).toBe("Full OS — including marketplace.");
    expect(MARKETMAN_POSITIONING_WEDGES).toHaveLength(3);
  });

  it("passes full MarketMan positioning audit", () => {
    const summary = auditMarketmanPositioning(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.compareContentWired).toBe(true);
    expect(summary.sectionWired).toBe(true);
    expect(summary.compareLandingWired).toBe(true);
    expect(summary.pricingWired).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("ships MarketMan positioning section with test id", () => {
    const source = readFileSync(
      join(ROOT, "components/marketing/marketman-positioning-section.tsx"),
      "utf8",
    );
    expect(source).toContain("MarketmanPositioningSection");
    expect(source).toContain("MARKETMAN_POSITIONING_SECTION_TEST_ID");
    expect(source).toContain("MARKETMAN_POSITIONING_PRIMARY_LINE");
    expect(MARKETMAN_POSITIONING_SECTION_TEST_ID).toBe("marketman-positioning-section");
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, MARKETMAN_POSITIONING_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, MARKETMAN_POSITIONING_DOC))).toBe(true);
    expect(existsSync(join(ROOT, MARKETMAN_POSITIONING_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[MARKETMAN_POSITIONING_NPM_SCRIPT]).toContain(
      "audit-marketman-positioning.ts",
    );
    expect(pkg.scripts?.["test:ci:marketman-positioning"]).toContain(
      MARKETMAN_POSITIONING_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, MARKETMAN_POSITIONING_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:marketman-positioning");
  });

  it("formats audit lines", () => {
    const summary = auditMarketmanPositioning(ROOT);
    const lines = formatMarketmanPositioningAuditLines(summary);
    expect(lines.some((line) => line.includes(MARKETMAN_POSITIONING_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes(MARKETMAN_POSITIONING_SECTION_TEST_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
