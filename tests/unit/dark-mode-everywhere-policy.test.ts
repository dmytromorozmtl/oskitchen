import { describe, expect, it } from "vitest";

import { auditDarkModeEverywhere } from "@/lib/design/dark-mode-everywhere-audit-policy";
import {
  DARK_MODE_EVERYWHERE_POLICY_ID,
  DARK_MODE_EVERYWHERE_ROLE_COUNT,
} from "@/lib/design/dark-mode-everywhere-policy";
import {
  ROLE_HERO_CARD_CLASS,
  roleTileToneClass,
} from "@/lib/design/dark-mode-everywhere-patterns";
import { loadDarkModeEverywhereSnapshot } from "@/services/design/dark-mode-everywhere-service";

describe("dark mode everywhere policy (DES-26)", () => {
  it("locks DES-26 policy and covers all five role modules", () => {
    expect(DARK_MODE_EVERYWHERE_POLICY_ID).toBe("dark-mode-everywhere-des26-v1");
    expect(DARK_MODE_EVERYWHERE_ROLE_COUNT).toBeGreaterThanOrEqual(12);
    expect(ROLE_HERO_CARD_CLASS.owner).toContain("dark:");
    expect(roleTileToneClass("attention")).toContain("dark:bg-amber-950");
  });

  it("passes audit on operator + role + leadership surfaces", () => {
    const report = auditDarkModeEverywhere();
    expect(report.legacyDarkBridgePresent).toBe(true);
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.passed)).toBe(true);
    expect(report.modules.every((m) => m.violations.length === 0)).toBe(true);
  });

  it("loads everywhere snapshot with full health score", () => {
    const snapshot = loadDarkModeEverywhereSnapshot();
    expect(snapshot.healthScore).toBe(100);
    expect(snapshot.passed).toBe(true);
    expect(snapshot.passedModuleCount).toBe(snapshot.moduleCount);
  });
});
