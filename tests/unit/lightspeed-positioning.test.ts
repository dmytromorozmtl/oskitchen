import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditLightspeedPositioning,
  formatLightspeedPositioningAuditLines,
} from "@/lib/marketing/lightspeed-positioning-audit";
import { LIGHTSPEED_POSITIONING_WEDGES } from "@/lib/marketing/lightspeed-positioning-content";
import {
  LIGHTSPEED_POSITIONING_AUDIT_SCRIPT,
  LIGHTSPEED_POSITIONING_CI_WORKFLOW,
  LIGHTSPEED_POSITIONING_DOC,
  LIGHTSPEED_POSITIONING_NPM_SCRIPT,
  LIGHTSPEED_POSITIONING_POLICY_ID,
  LIGHTSPEED_POSITIONING_PRIMARY_LINE,
  LIGHTSPEED_POSITIONING_SECTION_TEST_ID,
  LIGHTSPEED_POSITIONING_UNIT_TEST,
} from "@/lib/marketing/lightspeed-positioning-policy";

const ROOT = process.cwd();

describe("Lightspeed positioning (P1-76)", () => {
  it("locks policy id and canonical Lightspeed line", () => {
    expect(LIGHTSPEED_POSITIONING_POLICY_ID).toBe("lightspeed-positioning-p1-76-v1");
    expect(LIGHTSPEED_POSITIONING_PRIMARY_LINE).toBe("Built for food operators.");
    expect(LIGHTSPEED_POSITIONING_WEDGES).toHaveLength(3);
  });

  it("passes full Lightspeed positioning audit", () => {
    const summary = auditLightspeedPositioning(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.compareContentWired).toBe(true);
    expect(summary.sectionWired).toBe(true);
    expect(summary.compareLandingWired).toBe(true);
    expect(summary.pricingWired).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("ships Lightspeed positioning section with test id", () => {
    const source = readFileSync(
      join(ROOT, "components/marketing/lightspeed-positioning-section.tsx"),
      "utf8",
    );
    expect(source).toContain("LightspeedPositioningSection");
    expect(source).toContain("LIGHTSPEED_POSITIONING_SECTION_TEST_ID");
    expect(source).toContain("LIGHTSPEED_POSITIONING_PRIMARY_LINE");
    expect(LIGHTSPEED_POSITIONING_SECTION_TEST_ID).toBe("lightspeed-positioning-section");
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, LIGHTSPEED_POSITIONING_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, LIGHTSPEED_POSITIONING_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, LIGHTSPEED_POSITIONING_DOC))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[LIGHTSPEED_POSITIONING_NPM_SCRIPT]).toContain(
      "audit-lightspeed-positioning.ts",
    );
    expect(pkg.scripts?.["test:ci:lightspeed-positioning"]).toContain(
      LIGHTSPEED_POSITIONING_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, LIGHTSPEED_POSITIONING_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:lightspeed-positioning");
  });

  it("formats audit lines", () => {
    const summary = auditLightspeedPositioning(ROOT);
    const lines = formatLightspeedPositioningAuditLines(summary);
    expect(lines.some((line) => line.includes(LIGHTSPEED_POSITIONING_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes(LIGHTSPEED_POSITIONING_SECTION_TEST_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
