import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { POS_DESKTOP_TERMINAL_ERA92_POLICY_ID } from "@/lib/pos/pos-desktop-terminal-era92-policy";
import {
  POS_DESKTOP_TERMINAL_ERA167_CANONICAL_POLICY_ID,
  POS_DESKTOP_TERMINAL_ERA167_CAPABILITIES,
  POS_DESKTOP_TERMINAL_ERA167_POLICY_ID,
  POS_DESKTOP_TERMINAL_ERA167_ROUTE,
  POS_DESKTOP_TERMINAL_ERA167_SUMMARY_ARTIFACT,
  POS_DESKTOP_TERMINAL_ERA167_WIRING_PATHS,
} from "@/lib/pos/pos-desktop-terminal-era167-policy";
import {
  auditPosDesktopTerminalSmokeEra167Wiring,
  buildPosDesktopTerminalSmokeEra167Summary,
  resolvePosDesktopTerminalSmokeEra167ProofStatus,
} from "@/lib/pos/pos-desktop-terminal-era167-smoke-summary";

const ROOT = process.cwd();

describe("pos desktop terminal era167", () => {
  it("locks era167 policy and artifact path", () => {
    expect(POS_DESKTOP_TERMINAL_ERA167_POLICY_ID).toBe("era167-pos-desktop-terminal-v1");
    expect(POS_DESKTOP_TERMINAL_ERA167_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-desktop-terminal-era167-smoke-summary.json",
    );
    expect(POS_DESKTOP_TERMINAL_ERA167_ROUTE).toBe("/dashboard/pos/terminal");
    expect(POS_DESKTOP_TERMINAL_ERA167_WIRING_PATHS).toHaveLength(8);
    expect(POS_DESKTOP_TERMINAL_ERA167_CAPABILITIES).toHaveLength(2);
  });

  it("aligns era167 with canonical Desktop POS terminal policy", () => {
    expect(POS_DESKTOP_TERMINAL_ERA167_CANONICAL_POLICY_ID).toBe(
      POS_DESKTOP_TERMINAL_ERA92_POLICY_ID,
    );
  });

  it("audits in-repo Desktop POS Round 2 wiring", () => {
    const audit = auditPosDesktopTerminalSmokeEra167Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_DESKTOP_TERMINAL_ERA167_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes keyboard shortcuts and multi-monitor wiring", () => {
    const shortcuts = readFileSync(join(ROOT, "lib/keyboard/shortcuts.ts"), "utf8");
    expect(shortcuts).toContain("toggle_customer_display");
    expect(shortcuts).toContain("F8");

    const multiMonitor = readFileSync(join(ROOT, "lib/pos/pos-multi-monitor.ts"), "utf8");
    expect(multiMonitor).toContain("openPosCustomerDisplayWindow");
    expect(multiMonitor).toContain("BroadcastChannel");

    const page = readFileSync(join(ROOT, "app/dashboard/pos/terminal/page.tsx"), "utf8");
    expect(page).toContain("desktopMode");
    expect(page).toContain("customer-display");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosDesktopTerminalSmokeEra167ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosDesktopTerminalSmokeEra167ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosDesktopTerminalSmokeEra167Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("keyboard_shortcuts");
    expect(summary.capabilities).toContain("multi_monitor");
  });
});
