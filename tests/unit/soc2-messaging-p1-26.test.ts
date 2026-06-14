import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditSoc2MessagingP126,
  formatSoc2MessagingP126AuditLines,
} from "@/lib/marketing/soc2-messaging-p1-26-audit";
import {
  SOC2_MESSAGING_P1_26_APPROVED_LINE,
  SOC2_MESSAGING_P1_26_ARTIFACT,
  SOC2_MESSAGING_P1_26_AUDIT_MODULE,
  SOC2_MESSAGING_P1_26_BANNED_PHRASES,
  SOC2_MESSAGING_P1_26_CHECK_NPM_SCRIPT,
  SOC2_MESSAGING_P1_26_CI_NPM_SCRIPT,
  SOC2_MESSAGING_P1_26_CI_WORKFLOW,
  SOC2_MESSAGING_P1_26_DOC,
  SOC2_MESSAGING_P1_26_POLICY_ID,
  SOC2_MESSAGING_P1_26_WIRING_PATHS,
} from "@/lib/marketing/soc2-messaging-p1-26-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("SOC 2 messaging — in progress not certified (P1-26)", () => {
  it("locks P1-26 policy and banned certification phrases", () => {
    expect(SOC2_MESSAGING_P1_26_POLICY_ID).toBe("soc2-messaging-p1-26-v1");
    expect(SOC2_MESSAGING_P1_26_BANNED_PHRASES).toContain("SOC 2 compliant");
    expect(SOC2_MESSAGING_P1_26_BANNED_PHRASES).toContain("SOC 2 certified");
    expect(SOC2_MESSAGING_P1_26_APPROVED_LINE).toContain("Q4 2026");
    expect(SOC2_MESSAGING_P1_26_APPROVED_LINE).toContain("not certified");
  });

  it("detects banned SOC 2 certification phrases in sample copy", () => {
    const lower = "We are fully SOC 2 compliant for enterprise deals".toLowerCase();
    expect(
      SOC2_MESSAGING_P1_26_BANNED_PHRASES.some((phrase) => lower.includes(phrase.toLowerCase())),
    ).toBe(true);
  });

  it("passes full P1-26 marketing scan with zero banned phrase hits", () => {
    const summary = auditSoc2MessagingP126(ROOT);
    expect(summary.sourcesScanned).toBeGreaterThan(50);
    expect(summary.passed).toBe(true);
    expect(summary.hits).toHaveLength(0);
  });

  it("trust page uses approved in-progress SOC 2 line", () => {
    const trustPage = readSource("app/trust/page.tsx");
    expect(trustPage).toContain(SOC2_MESSAGING_P1_26_APPROVED_LINE);
    expect(trustPage.toLowerCase()).not.toContain("soc 2 compliant");
  });

  it("forbidden claims cheat sheet documents SOC 2 in-progress line", () => {
    const cheatSheet = readSource("lib/marketing/forbidden-claims-cheat-sheet-content.ts");
    expect(cheatSheet).toContain("soc2-scim");
    expect(cheatSheet).toContain(SOC2_MESSAGING_P1_26_APPROVED_LINE);
    expect(cheatSheet.toLowerCase()).not.toContain("soc 2 compliant");
  });

  it("trust center copy doc uses approved SOC 2 line", () => {
    const doc = readSource("docs/TRUST_CENTER_COPY.md");
    expect(doc).toContain(SOC2_MESSAGING_P1_26_APPROVED_LINE);
    expect(doc.toLowerCase()).not.toContain("soc 2 compliant");
  });

  it("P1-26 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of SOC2_MESSAGING_P1_26_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${SOC2_MESSAGING_P1_26_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${SOC2_MESSAGING_P1_26_CI_NPM_SCRIPT}"`);

    const ci = readSource(SOC2_MESSAGING_P1_26_CI_WORKFLOW);
    expect(ci).toContain(SOC2_MESSAGING_P1_26_CHECK_NPM_SCRIPT);

    const doc = readSource(SOC2_MESSAGING_P1_26_DOC);
    expect(doc).toContain(SOC2_MESSAGING_P1_26_POLICY_ID);
    expect(doc).toContain(SOC2_MESSAGING_P1_26_APPROVED_LINE);

    expect(existsSync(join(ROOT, SOC2_MESSAGING_P1_26_AUDIT_MODULE))).toBe(true);

    const artifact = JSON.parse(readSource(SOC2_MESSAGING_P1_26_ARTIFACT));
    expect(artifact.policyId).toBe(SOC2_MESSAGING_P1_26_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditSoc2MessagingP126(ROOT);
    const lines = formatSoc2MessagingP126AuditLines(summary);
    expect(lines.some((line) => line.includes(SOC2_MESSAGING_P1_26_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
