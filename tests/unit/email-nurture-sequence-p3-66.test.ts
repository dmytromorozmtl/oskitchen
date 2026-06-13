import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditEmailNurtureSequenceP3_66,
  formatEmailNurtureSequenceP3_66AuditLines,
} from "@/lib/marketing/email-nurture-sequence-p3-66-audit";
import { validateEmailNurtureSequenceContract } from "@/lib/marketing/email-nurture-sequence-p3-66-measurement";
import {
  EMAIL_NURTURE_SEQUENCE_P3_66_AUDIT_SCRIPT,
  EMAIL_NURTURE_SEQUENCE_P3_66_CHECK_NPM_SCRIPT,
  EMAIL_NURTURE_SEQUENCE_P3_66_DOC,
  EMAIL_NURTURE_SEQUENCE_P3_66_EMAIL_COUNT,
  EMAIL_NURTURE_SEQUENCE_P3_66_NPM_SCRIPT,
  EMAIL_NURTURE_SEQUENCE_P3_66_NPM_SCRIPTS,
  EMAIL_NURTURE_SEQUENCE_P3_66_PLAYBOOK_DOC,
  EMAIL_NURTURE_SEQUENCE_P3_66_POLICY_ID,
  EMAIL_NURTURE_SEQUENCE_P3_66_UNIT_TEST,
  EMAIL_NURTURE_SEQUENCE_P3_66_UPSTREAM_POLICY_ID,
} from "@/lib/marketing/email-nurture-sequence-p3-66-policy";

const ROOT = process.cwd();

describe("Email nurture sequence (P3-66)", () => {
  it("locks P3-66 policy and five-email inbound sequence", () => {
    expect(EMAIL_NURTURE_SEQUENCE_P3_66_POLICY_ID).toBe("email-nurture-sequence-p3-66-v1");
    expect(EMAIL_NURTURE_SEQUENCE_P3_66_UPSTREAM_POLICY_ID).toBe(
      "email-nurture-5-sequence-mkt19-v1",
    );
    expect(EMAIL_NURTURE_SEQUENCE_P3_66_PLAYBOOK_DOC).toBe("docs/email-nurture-5-sequence.md");
    expect(EMAIL_NURTURE_SEQUENCE_P3_66_EMAIL_COUNT).toBe(5);
  });

  it("validates email nurture sequence contract", () => {
    const validation = validateEmailNurtureSequenceContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.upstreamDocOk).toBe(true);
    expect(validation.fiveEmailsPresent).toBe(true);
    expect(validation.claimsLintOk).toBe(true);
    expect(validation.outboundHandoffWired).toBe(true);
  });

  it("passes full email nurture sequence audit", () => {
    const summary = auditEmailNurtureSequenceP3_66(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.upstreamPolicyAligned).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatEmailNurtureSequenceP3_66AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, EMAIL_NURTURE_SEQUENCE_P3_66_DOC))).toBe(true);
    expect(existsSync(join(ROOT, EMAIL_NURTURE_SEQUENCE_P3_66_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, EMAIL_NURTURE_SEQUENCE_P3_66_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[EMAIL_NURTURE_SEQUENCE_P3_66_NPM_SCRIPT]).toContain(
      "audit-email-nurture-sequence-p3-66.ts",
    );
    expect(pkg.scripts?.[EMAIL_NURTURE_SEQUENCE_P3_66_CHECK_NPM_SCRIPT]).toContain(
      EMAIL_NURTURE_SEQUENCE_P3_66_UNIT_TEST,
    );
    for (const script of EMAIL_NURTURE_SEQUENCE_P3_66_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
