import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCommissaryLandingP3_61,
  formatCommissaryLandingP3_61AuditLines,
} from "@/lib/marketing/commissary-landing-p3-61-audit";
import { validateCommissaryLandingContract } from "@/lib/marketing/commissary-landing-p3-61-measurement";
import {
  COMMISSARY_LANDING_P3_61_AUDIT_SCRIPT,
  COMMISSARY_LANDING_P3_61_CANONICAL_PATH,
  COMMISSARY_LANDING_P3_61_CHECK_NPM_SCRIPT,
  COMMISSARY_LANDING_P3_61_DOC,
  COMMISSARY_LANDING_P3_61_NPM_SCRIPT,
  COMMISSARY_LANDING_P3_61_NPM_SCRIPTS,
  COMMISSARY_LANDING_P3_61_POLICY_ID,
  COMMISSARY_LANDING_P3_61_PRIMARY_KEYWORD,
  COMMISSARY_LANDING_P3_61_UNIT_TEST,
  commissaryLandingPathsAligned,
} from "@/lib/marketing/commissary-landing-p3-61-policy";

const ROOT = process.cwd();

describe("Commissary landing (P3-61)", () => {
  it("locks canonical /commissary-kitchen-software path", () => {
    expect(COMMISSARY_LANDING_P3_61_POLICY_ID).toBe("commissary-landing-p3-61-v1");
    expect(COMMISSARY_LANDING_P3_61_CANONICAL_PATH).toBe("/commissary-kitchen-software");
    expect(COMMISSARY_LANDING_P3_61_PRIMARY_KEYWORD).toBe("commissary kitchen software");
    expect(commissaryLandingPathsAligned()).toBe(true);
  });

  it("validates commissary landing contract", () => {
    const validation = validateCommissaryLandingContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.pathsAligned).toBe(true);
    expect(validation.legacyRedirectWired).toBe(true);
  });

  it("passes full commissary landing audit", () => {
    const summary = auditCommissaryLandingP3_61(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.canonicalPathWired).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatCommissaryLandingP3_61AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, COMMISSARY_LANDING_P3_61_DOC))).toBe(true);
    expect(existsSync(join(ROOT, COMMISSARY_LANDING_P3_61_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, COMMISSARY_LANDING_P3_61_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[COMMISSARY_LANDING_P3_61_NPM_SCRIPT]).toContain(
      "audit-commissary-landing-p3-61.ts",
    );
    expect(pkg.scripts?.[COMMISSARY_LANDING_P3_61_CHECK_NPM_SCRIPT]).toContain(
      COMMISSARY_LANDING_P3_61_UNIT_TEST,
    );
    for (const script of COMMISSARY_LANDING_P3_61_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
