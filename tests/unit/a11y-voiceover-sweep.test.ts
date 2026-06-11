import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditA11yVoiceoverSweep,
  formatA11yVoiceoverSweepAuditLines,
} from "@/lib/design/a11y-voiceover-sweep-audit";
import {
  A11Y_VOICEOVER_KDS_MODULE,
  A11Y_VOICEOVER_LIVE_REGION_MODULE,
  A11Y_VOICEOVER_POS_CART_MODULE,
  A11Y_VOICEOVER_POS_PAYMENT_MODULE,
  A11Y_VOICEOVER_SWEEP_ASSISTIVE_TECH,
  A11Y_VOICEOVER_SWEEP_AUDIT_SCRIPT,
  A11Y_VOICEOVER_SWEEP_CI_WORKFLOW,
  A11Y_VOICEOVER_SWEEP_NPM_SCRIPT,
  A11Y_VOICEOVER_SWEEP_POLICY_ID,
  A11Y_VOICEOVER_SWEEP_SURFACES,
  A11Y_VOICEOVER_SWEEP_UNIT_TEST,
  A11Y_VOICEOVER_TODAY_MODULE,
  KDS_VOICEOVER_LIVE_REGION_TEST_ID,
  kdsVoiceoverBumpAnnouncement,
  TODAY_VOICEOVER_PAGE_TITLE_ID,
} from "@/lib/design/a11y-voiceover-sweep-policy";

const ROOT = process.cwd();

describe("A11y VoiceOver sweep (P1-68)", () => {
  it("locks policy id and three revenue surfaces", () => {
    expect(A11Y_VOICEOVER_SWEEP_POLICY_ID).toBe("a11y-voiceover-sweep-p1-68-v1");
    expect(A11Y_VOICEOVER_SWEEP_SURFACES).toEqual(["today", "pos", "kds"]);
    expect(A11Y_VOICEOVER_SWEEP_ASSISTIVE_TECH).toEqual(["VoiceOver", "NVDA"]);
  });

  it("builds KDS bump announcements for screen readers", () => {
    expect(kdsVoiceoverBumpAnnouncement("1042")).toBe("Order 1042 bumped to expo");
  });

  it("ships VoiceoverLiveRegion primitive", () => {
    const source = readFileSync(join(ROOT, A11Y_VOICEOVER_LIVE_REGION_MODULE), "utf8");
    expect(source).toContain("aria-live");
    expect(source).toContain("sr-only");
    expect(source).toContain("VoiceoverLiveRegion");
  });

  it("wires Today page title and sr-only nav hint", () => {
    const source = readFileSync(join(ROOT, A11Y_VOICEOVER_TODAY_MODULE), "utf8");
    expect(source).toContain("TODAY_VOICEOVER_PAGE_TITLE_ID");
    expect(source).toContain("TODAY_VOICEOVER_SR_HINT_TEST_ID");
    expect(source).toContain(`id={TODAY_VOICEOVER_PAGE_TITLE_ID}`);
  });

  it("passes full VoiceOver sweep audit", () => {
    const summary = auditA11yVoiceoverSweep(ROOT);
    expect(summary.liveRegionModulePresent).toBe(true);
    expect(summary.todayWired).toBe(true);
    expect(summary.posCartWired).toBe(true);
    expect(summary.posPaymentWired).toBe(true);
    expect(summary.kdsWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, A11Y_VOICEOVER_SWEEP_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, A11Y_VOICEOVER_SWEEP_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[A11Y_VOICEOVER_SWEEP_NPM_SCRIPT]).toContain(
      "audit-a11y-voiceover-sweep.ts",
    );
    expect(pkg.scripts?.["test:ci:a11y-voiceover-sweep"]).toContain(
      A11Y_VOICEOVER_SWEEP_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, A11Y_VOICEOVER_SWEEP_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:a11y-voiceover-sweep");
  });

  it("formats audit lines", () => {
    const summary = auditA11yVoiceoverSweep(ROOT);
    const lines = formatA11yVoiceoverSweepAuditLines(summary);
    expect(lines.some((line) => line.includes(A11Y_VOICEOVER_SWEEP_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes(TODAY_VOICEOVER_PAGE_TITLE_ID))).toBe(true);
    expect(lines.some((line) => line.includes(KDS_VOICEOVER_LIVE_REGION_TEST_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
