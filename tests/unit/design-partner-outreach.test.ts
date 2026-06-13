import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditDesignPartnerOutreach,
  formatDesignPartnerOutreachAuditLines,
} from "@/lib/marketing/design-partner-outreach-audit";
import {
  DESIGN_PARTNER_OUTREACH_MONTREAL_OPERATORS,
  DESIGN_PARTNER_OUTREACH_OPERATORS,
  DESIGN_PARTNER_OUTREACH_SEGMENT_COUNTS,
} from "@/lib/marketing/design-partner-outreach-content";
import {
  DESIGN_PARTNER_OUTREACH_CHECK_NPM_SCRIPT,
  DESIGN_PARTNER_OUTREACH_DOC,
  DESIGN_PARTNER_OUTREACH_MONTREAL_MIN_COUNT,
  DESIGN_PARTNER_OUTREACH_NPM_SCRIPT,
  DESIGN_PARTNER_OUTREACH_OPERATOR_COUNT,
  DESIGN_PARTNER_OUTREACH_POLICY_ID,
  DESIGN_PARTNER_OUTREACH_UNIT_TEST,
} from "@/lib/marketing/design-partner-outreach-policy";

const ROOT = process.cwd();

describe("Design partner outreach — 20 Montreal/Canada operators (P1-25)", () => {
  it("locks policy id and operator counts", () => {
    expect(DESIGN_PARTNER_OUTREACH_POLICY_ID).toBe("design-partner-outreach-p1-25-v1");
    expect(DESIGN_PARTNER_OUTREACH_OPERATOR_COUNT).toBe(20);
    expect(DESIGN_PARTNER_OUTREACH_OPERATORS).toHaveLength(20);
    expect(DESIGN_PARTNER_OUTREACH_MONTREAL_MIN_COUNT).toBe(12);
    expect(DESIGN_PARTNER_OUTREACH_MONTREAL_OPERATORS.length).toBeGreaterThanOrEqual(12);
    expect(DESIGN_PARTNER_OUTREACH_SEGMENT_COUNTS.meal_prep).toBeGreaterThanOrEqual(4);
    expect(DESIGN_PARTNER_OUTREACH_SEGMENT_COUNTS.ghost_kitchen).toBeGreaterThanOrEqual(3);
  });

  it("keeps all operators as research targets until CRM contact", () => {
    for (const operator of DESIGN_PARTNER_OUTREACH_OPERATORS) {
      expect(operator.status).toBe("research_target");
      expect(operator.outreachHook.length).toBeGreaterThan(10);
    }
  });

  it("passes full design partner outreach audit", () => {
    const summary = auditDesignPartnerOutreach(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.operatorCountCorrect).toBe(true);
    expect(summary.montrealCountCorrect).toBe(true);
    expect(summary.allResearchTargets).toBe(true);
    expect(summary.emailSequenceLinked).toBe(true);
    expect(summary.loiLinked).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, DESIGN_PARTNER_OUTREACH_DOC))).toBe(true);
    expect(existsSync(join(ROOT, DESIGN_PARTNER_OUTREACH_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[DESIGN_PARTNER_OUTREACH_NPM_SCRIPT]).toContain(
      "audit-design-partner-outreach.ts",
    );
    expect(pkg.scripts?.[DESIGN_PARTNER_OUTREACH_CHECK_NPM_SCRIPT]).toContain(
      DESIGN_PARTNER_OUTREACH_UNIT_TEST,
    );
  });

  it("formats audit lines", () => {
    const summary = auditDesignPartnerOutreach(ROOT);
    const lines = formatDesignPartnerOutreachAuditLines(summary);
    expect(lines.some((line) => line.includes(DESIGN_PARTNER_OUTREACH_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
