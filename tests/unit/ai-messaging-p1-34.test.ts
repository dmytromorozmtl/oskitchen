import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditAiMessagingP134,
  formatAiMessagingP134AuditLines,
} from "@/lib/marketing/ai-messaging-p1-34-audit";
import {
  AI_MESSAGING_P1_34_APPROVED_LINE,
  AI_MESSAGING_P1_34_ARTIFACT,
  AI_MESSAGING_P1_34_AUDIT_MODULE,
  AI_MESSAGING_P1_34_BANNED_PHRASES,
  AI_MESSAGING_P1_34_CHECK_NPM_SCRIPT,
  AI_MESSAGING_P1_34_CI_NPM_SCRIPT,
  AI_MESSAGING_P1_34_CI_WORKFLOW,
  AI_MESSAGING_P1_34_DOC,
  AI_MESSAGING_P1_34_POLICY_ID,
  AI_MESSAGING_P1_34_WIRING_PATHS,
} from "@/lib/marketing/ai-messaging-p1-34-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("AI messaging — AI-assisted not AI-powered (P1-34)", () => {
  it("locks P1-34 policy and banned AI-powered phrases", () => {
    expect(AI_MESSAGING_P1_34_POLICY_ID).toBe("ai-messaging-p1-34-v1");
    expect(AI_MESSAGING_P1_34_BANNED_PHRASES).toContain("AI-powered");
    expect(AI_MESSAGING_P1_34_BANNED_PHRASES).toContain("AI powered");
    expect(AI_MESSAGING_P1_34_APPROVED_LINE).toContain("AI-assisted");
    expect(AI_MESSAGING_P1_34_APPROVED_LINE).toContain("human-in-the-loop");
  });

  it("detects banned AI-powered phrase in sample copy", () => {
    const lower = "Our fully AI-powered restaurant platform".toLowerCase();
    expect(
      AI_MESSAGING_P1_34_BANNED_PHRASES.some((phrase) => lower.includes(phrase.toLowerCase())),
    ).toBe(true);
  });

  it("passes full P1-34 marketing scan with zero AI-powered hits", () => {
    const summary = auditAiMessagingP134(ROOT);
    expect(summary.sourcesScanned).toBeGreaterThan(20);
    expect(summary.passed, JSON.stringify(summary.hits, null, 2)).toBe(true);
    expect(summary.hits).toHaveLength(0);
  });

  it("ai moats page uses AI-assisted umbrella claim", () => {
    const content = readSource("components/marketing/ai-moats-honest-positioning-content.tsx");
    expect(content).toContain("AI-assisted operations hub");
    expect(content.toLowerCase()).not.toContain("ai-powered");
  });

  it("forbidden claims cheat sheet documents AI-assisted line", () => {
    const cheatSheet = readSource("lib/marketing/forbidden-claims-cheat-sheet-content.ts");
    expect(cheatSheet).toContain("ai-assisted-messaging");
    expect(cheatSheet).toContain(AI_MESSAGING_P1_34_APPROVED_LINE);
    expect(cheatSheet.toLowerCase()).not.toContain("ai-powered");
  });

  it("invoice scanner honesty label uses AI-assisted wording", () => {
    const labels = readSource("lib/ai/ai-honesty-labels.ts");
    expect(labels).toContain("AI-assisted invoice scanning");
    expect(labels.toLowerCase()).not.toContain("ai-powered");
  });

  it("P1-34 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of AI_MESSAGING_P1_34_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${AI_MESSAGING_P1_34_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${AI_MESSAGING_P1_34_CI_NPM_SCRIPT}"`);

    const ci = readSource(AI_MESSAGING_P1_34_CI_WORKFLOW);
    expect(ci).toContain(AI_MESSAGING_P1_34_CHECK_NPM_SCRIPT);

    const doc = readSource(AI_MESSAGING_P1_34_DOC);
    expect(doc).toContain(AI_MESSAGING_P1_34_POLICY_ID);

    expect(existsSync(join(ROOT, AI_MESSAGING_P1_34_AUDIT_MODULE))).toBe(true);

    const artifact = JSON.parse(readSource(AI_MESSAGING_P1_34_ARTIFACT));
    expect(artifact.policyId).toBe(AI_MESSAGING_P1_34_POLICY_ID);
    expect(artifact.preferredTerm).toBe("AI-assisted");
  });

  it("formats audit lines", () => {
    const summary = auditAiMessagingP134(ROOT);
    const lines = formatAiMessagingP134AuditLines(summary);
    expect(lines.some((line) => line.includes(AI_MESSAGING_P1_34_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
