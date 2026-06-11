import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditSingleOnboardingEntry,
  formatSingleOnboardingEntryAuditLines,
} from "@/lib/design/single-onboarding-entry-audit";
import {
  LEGACY_ONBOARDING_ENTRIES,
  ONBOARDING_HUB_PATH,
  SINGLE_ONBOARDING_ENTRY_AUDIT_SCRIPT,
  SINGLE_ONBOARDING_ENTRY_CI_WORKFLOW,
  SINGLE_ONBOARDING_ENTRY_NPM_SCRIPT,
  SINGLE_ONBOARDING_ENTRY_POLICY_ID,
  SINGLE_ONBOARDING_ENTRY_UNIT_TEST,
  resolveRecommendedOnboardingEntry,
} from "@/lib/design/single-onboarding-entry-policy";

const ROOT = process.cwd();

describe("single onboarding entry (P1-57)", () => {
  it("locks policy id and four legacy onboarding paths", () => {
    expect(SINGLE_ONBOARDING_ENTRY_POLICY_ID).toBe("single-onboarding-entry-p1-57-v1");
    expect(ONBOARDING_HUB_PATH).toBe("/dashboard/onboarding-hub");
    expect(LEGACY_ONBOARDING_ENTRIES).toHaveLength(4);
    expect(LEGACY_ONBOARDING_ENTRIES.map((e) => e.id)).toEqual([
      "launch_wizard",
      "quick_start",
      "go_live",
      "implementation",
    ]);
  });

  it("recommends Launch Wizard as primary spine", () => {
    const recommended = resolveRecommendedOnboardingEntry();
    expect(recommended.id).toBe("launch_wizard");
    expect(recommended.href).toBe("/dashboard/launch-wizard");
  });

  it("passes full single onboarding entry audit", () => {
    const summary = auditSingleOnboardingEntry(ROOT);
    expect(summary.hubPagePresent).toBe(true);
    expect(summary.hubViewPresent).toBe(true);
    expect(summary.hubInFocusedNav).toBe(true);
    expect(summary.legacyHiddenFromFocusedNav).toBe(4);
    expect(summary.pilotNavUsesHub).toBe(true);
    expect(summary.hubLinksAllLegacyEntries).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, SINGLE_ONBOARDING_ENTRY_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, SINGLE_ONBOARDING_ENTRY_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SINGLE_ONBOARDING_ENTRY_NPM_SCRIPT]).toContain(
      "audit-single-onboarding-entry.ts",
    );
    expect(pkg.scripts?.["test:ci:single-onboarding-entry"]).toContain(
      SINGLE_ONBOARDING_ENTRY_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, SINGLE_ONBOARDING_ENTRY_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:single-onboarding-entry");
  });

  it("formats audit lines", () => {
    const summary = auditSingleOnboardingEntry(ROOT);
    const lines = formatSingleOnboardingEntryAuditLines(summary);
    expect(lines.some((line) => line.includes(SINGLE_ONBOARDING_ENTRY_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
