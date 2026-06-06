import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_TABLET_TERMINAL_ERA93_MIN_TOUCH_PX,
  POS_TABLET_TERMINAL_ERA93_POLICY_ID,
  POS_TABLET_TERMINAL_ERA93_ROUTE,
  POS_TABLET_TERMINAL_ERA93_SUMMARY_ARTIFACT,
  POS_TABLET_TERMINAL_ERA93_WIRING_PATHS,
} from "@/lib/pos/pos-tablet-terminal-era93-policy";
import {
  auditPosTabletTerminalSmokeWiring,
  buildPosTabletTerminalSmokeEra93Summary,
  resolvePosTabletTerminalSmokeEra93ProofStatus,
} from "@/lib/pos/pos-tablet-terminal-smoke-summary";

const ROOT = process.cwd();

describe("pos tablet terminal era93", () => {
  it("locks era93 policy and artifact path", () => {
    expect(POS_TABLET_TERMINAL_ERA93_POLICY_ID).toBe("era93-pos-tablet-terminal-v1");
    expect(POS_TABLET_TERMINAL_ERA93_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-tablet-terminal-smoke-summary.json",
    );
    expect(POS_TABLET_TERMINAL_ERA93_ROUTE).toBe("/dashboard/pos/tablet");
    expect(POS_TABLET_TERMINAL_ERA93_MIN_TOUCH_PX).toBe(44);
  });

  it("audits in-repo Tablet POS wiring", () => {
    const audit = auditPosTabletTerminalSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_TABLET_TERMINAL_ERA93_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes portrait/landscape and tabletMode in client", () => {
    const client = readFileSync(join(ROOT, "components/pos/pos-tablet-client.tsx"), "utf8");
    expect(client).toContain("tabletMode");
    expect(client).toContain("pos-tablet-shell");
    expect(client).toContain("POS_TABLET_POS_MIN_TOUCH_PX");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosTabletTerminalSmokeEra93ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosTabletTerminalSmokeEra93ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosTabletTerminalSmokeEra93Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.minTouchPx).toBe(44);
  });
});
