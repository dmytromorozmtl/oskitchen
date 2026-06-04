import { describe, expect, it } from "vitest";

import {
  auditDarkModeConsistency,
  DARK_MODE_CONSISTENCY_POLICY_ID,
  dashboardShellHeaderClass,
  dashboardShellRootClass,
  findDarkModeLightOnlyViolations,
  hasLegacyDarkColorBridge,
} from "@/lib/design/dark-mode-consistency-policy";

describe("dark mode consistency policy (DES-24)", () => {
  it("locks DES-24 policy id and shell surface classes", () => {
    expect(DARK_MODE_CONSISTENCY_POLICY_ID).toBe("dark-mode-consistency-des24-v1");
    expect(dashboardShellRootClass).toContain("bg-background");
    expect(dashboardShellHeaderClass).toContain("bg-background");
    expect(dashboardShellRootClass).not.toContain("bg-white");
  });

  it("flags hardcoded bg-white in themeable surfaces", () => {
    const violations = findDarkModeLightOnlyViolations(`
      <div className="min-h-screen bg-white" />
      <div className="bg-background" />
    `);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.pattern).toBe("bg-white");
  });

  it("maps legacy color tokens under .dark in globals.css", () => {
    expect(hasLegacyDarkColorBridge()).toBe(true);
  });

  it("passes audit on operator dashboard surfaces", () => {
    const report = auditDarkModeConsistency();
    expect(report.passed).toBe(true);
    expect(report.legacyDarkBridgePresent).toBe(true);
    expect(report.modules.every((m) => m.violations.length === 0)).toBe(true);
  });
});
