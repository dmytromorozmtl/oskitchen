import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditToastPositioning,
  formatToastPositioningAuditLines,
} from "@/lib/marketing/toast-positioning-audit";
import {
  TOAST_POSITIONING_AUDIT_SCRIPT,
  TOAST_POSITIONING_CI_WORKFLOW,
  TOAST_POSITIONING_DOC,
  TOAST_POSITIONING_NPM_SCRIPT,
  TOAST_POSITIONING_POLICY_ID,
  TOAST_POSITIONING_PRIMARY_LINE,
  TOAST_POSITIONING_SECTION_TEST_ID,
  TOAST_POSITIONING_UNIT_TEST,
} from "@/lib/marketing/toast-positioning-policy";
import { TOAST_POSITIONING_WEDGES } from "@/lib/marketing/toast-positioning-content";

const ROOT = process.cwd();

describe("Toast positioning (P1-74)", () => {
  it("locks policy id and canonical Toast line", () => {
    expect(TOAST_POSITIONING_POLICY_ID).toBe("toast-positioning-p1-74-v1");
    expect(TOAST_POSITIONING_PRIMARY_LINE).toBe("Hardware shouldn't lock you in.");
    expect(TOAST_POSITIONING_WEDGES).toHaveLength(3);
  });

  it("passes full Toast positioning audit", () => {
    const summary = auditToastPositioning(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.compareContentWired).toBe(true);
    expect(summary.sectionWired).toBe(true);
    expect(summary.compareLandingWired).toBe(true);
    expect(summary.pricingWired).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("ships Toast positioning section with test id", () => {
    const source = readFileSync(
      join(ROOT, "components/marketing/toast-positioning-section.tsx"),
      "utf8",
    );
    expect(source).toContain("ToastPositioningSection");
    expect(source).toContain("TOAST_POSITIONING_SECTION_TEST_ID");
    expect(source).toContain("TOAST_POSITIONING_PRIMARY_LINE");
    expect(TOAST_POSITIONING_SECTION_TEST_ID).toBe("toast-positioning-section");
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, TOAST_POSITIONING_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, TOAST_POSITIONING_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, TOAST_POSITIONING_DOC))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[TOAST_POSITIONING_NPM_SCRIPT]).toContain(
      "audit-toast-positioning.ts",
    );
    expect(pkg.scripts?.["test:ci:toast-positioning"]).toContain(TOAST_POSITIONING_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, TOAST_POSITIONING_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:toast-positioning");
  });

  it("formats audit lines", () => {
    const summary = auditToastPositioning(ROOT);
    const lines = formatToastPositioningAuditLines(summary);
    expect(lines.some((line) => line.includes(TOAST_POSITIONING_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes(TOAST_POSITIONING_SECTION_TEST_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
