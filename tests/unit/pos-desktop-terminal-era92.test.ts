import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_DESKTOP_TERMINAL_ERA92_POLICY_ID,
  POS_DESKTOP_TERMINAL_ERA92_ROUTE,
  POS_DESKTOP_TERMINAL_ERA92_SUMMARY_ARTIFACT,
  POS_DESKTOP_TERMINAL_ERA92_WIRING_PATHS,
} from "@/lib/pos/pos-desktop-terminal-era92-policy";
import {
  auditPosDesktopTerminalSmokeWiring,
  buildPosDesktopTerminalSmokeEra92Summary,
  resolvePosDesktopTerminalSmokeEra92ProofStatus,
} from "@/lib/pos/pos-desktop-terminal-smoke-summary";

const ROOT = process.cwd();

describe("pos desktop terminal era92", () => {
  it("locks era92 policy and artifact path", () => {
    expect(POS_DESKTOP_TERMINAL_ERA92_POLICY_ID).toBe("era92-pos-desktop-terminal-v1");
    expect(POS_DESKTOP_TERMINAL_ERA92_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-desktop-terminal-smoke-summary.json",
    );
    expect(POS_DESKTOP_TERMINAL_ERA92_ROUTE).toBe("/dashboard/pos/terminal");
  });

  it("audits in-repo Desktop POS wiring", () => {
    const audit = auditPosDesktopTerminalSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_DESKTOP_TERMINAL_ERA92_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes F8 customer display in terminal client", () => {
    const client = readFileSync(
      join(ROOT, "components/dashboard/pos-terminal-client.tsx"),
      "utf8",
    );
    expect(client).toContain("toggle_customer_display");
    expect(client).toContain("PosDesktopShortcutsOverlay");
    expect(client).toContain("openPosCustomerDisplayWindow");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosDesktopTerminalSmokeEra92ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosDesktopTerminalSmokeEra92ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosDesktopTerminalSmokeEra92Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
  });
});
