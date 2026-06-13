import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditSocialProofSectionP3_67,
  formatSocialProofSectionP3_67AuditLines,
} from "@/lib/marketing/social-proof-section-p3-67-audit";
import { validateSocialProofSectionContract } from "@/lib/marketing/social-proof-section-p3-67-measurement";
import {
  SOCIAL_PROOF_SECTION_P3_67_AUDIT_SCRIPT,
  SOCIAL_PROOF_SECTION_P3_67_CHECK_NPM_SCRIPT,
  SOCIAL_PROOF_SECTION_P3_67_COMPONENT,
  SOCIAL_PROOF_SECTION_P3_67_DOC,
  SOCIAL_PROOF_SECTION_P3_67_LANDING_COMPONENTS,
  SOCIAL_PROOF_SECTION_P3_67_MIN_LANDING_COUNT,
  SOCIAL_PROOF_SECTION_P3_67_NPM_SCRIPT,
  SOCIAL_PROOF_SECTION_P3_67_NPM_SCRIPTS,
  SOCIAL_PROOF_SECTION_P3_67_POLICY_ID,
  SOCIAL_PROOF_SECTION_P3_67_TEST_ID,
  SOCIAL_PROOF_SECTION_P3_67_UNIT_TEST,
} from "@/lib/marketing/social-proof-section-p3-67-policy";
import { SOCIAL_PROOF_DEFAULT_STATS } from "@/lib/marketing/social-proof-section-content";

const ROOT = process.cwd();

describe("Social proof section (P3-67)", () => {
  it("locks P3-67 policy and component test id", () => {
    expect(SOCIAL_PROOF_SECTION_P3_67_POLICY_ID).toBe("social-proof-section-p3-67-v1");
    expect(SOCIAL_PROOF_SECTION_P3_67_TEST_ID).toBe("social-proof-section");
    expect(SOCIAL_PROOF_SECTION_P3_67_LANDING_COMPONENTS).toHaveLength(
      SOCIAL_PROOF_SECTION_P3_67_MIN_LANDING_COUNT,
    );
    expect(SOCIAL_PROOF_DEFAULT_STATS.length).toBeGreaterThanOrEqual(3);
  });

  it("validates social proof section contract", () => {
    const validation = validateSocialProofSectionContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.componentWiringOk).toBe(true);
    expect(validation.landingsWired).toBe(SOCIAL_PROOF_SECTION_P3_67_MIN_LANDING_COUNT);
  });

  it("passes full social proof section audit", () => {
    const summary = auditSocialProofSectionP3_67(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.landingsWired).toBe(SOCIAL_PROOF_SECTION_P3_67_MIN_LANDING_COUNT);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatSocialProofSectionP3_67AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, SOCIAL_PROOF_SECTION_P3_67_DOC))).toBe(true);
    expect(existsSync(join(ROOT, SOCIAL_PROOF_SECTION_P3_67_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, SOCIAL_PROOF_SECTION_P3_67_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, SOCIAL_PROOF_SECTION_P3_67_COMPONENT))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SOCIAL_PROOF_SECTION_P3_67_NPM_SCRIPT]).toContain(
      "audit-social-proof-section-p3-67.ts",
    );
    expect(pkg.scripts?.[SOCIAL_PROOF_SECTION_P3_67_CHECK_NPM_SCRIPT]).toContain(
      SOCIAL_PROOF_SECTION_P3_67_UNIT_TEST,
    );
    for (const script of SOCIAL_PROOF_SECTION_P3_67_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
