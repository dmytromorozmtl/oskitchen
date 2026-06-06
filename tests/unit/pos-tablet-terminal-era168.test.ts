import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { POS_TABLET_TERMINAL_ERA93_POLICY_ID } from "@/lib/pos/pos-tablet-terminal-era93-policy";
import {
  POS_TABLET_TERMINAL_ERA168_CANONICAL_POLICY_ID,
  POS_TABLET_TERMINAL_ERA168_CAPABILITIES,
  POS_TABLET_TERMINAL_ERA168_MIN_TOUCH_PX,
  POS_TABLET_TERMINAL_ERA168_POLICY_ID,
  POS_TABLET_TERMINAL_ERA168_ROUTE,
  POS_TABLET_TERMINAL_ERA168_SUMMARY_ARTIFACT,
  POS_TABLET_TERMINAL_ERA168_WIRING_PATHS,
} from "@/lib/pos/pos-tablet-terminal-era168-policy";
import {
  auditPosTabletTerminalSmokeEra168Wiring,
  buildPosTabletTerminalSmokeEra168Summary,
  resolvePosTabletTerminalSmokeEra168ProofStatus,
} from "@/lib/pos/pos-tablet-terminal-era168-smoke-summary";

const ROOT = process.cwd();

describe("pos tablet terminal era168", () => {
  it("locks era168 policy and artifact path", () => {
    expect(POS_TABLET_TERMINAL_ERA168_POLICY_ID).toBe("era168-pos-tablet-terminal-v1");
    expect(POS_TABLET_TERMINAL_ERA168_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-tablet-terminal-era168-smoke-summary.json",
    );
    expect(POS_TABLET_TERMINAL_ERA168_ROUTE).toBe("/dashboard/pos/tablet");
    expect(POS_TABLET_TERMINAL_ERA168_MIN_TOUCH_PX).toBe(44);
    expect(POS_TABLET_TERMINAL_ERA168_WIRING_PATHS).toHaveLength(7);
    expect(POS_TABLET_TERMINAL_ERA168_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era168 with canonical Tablet POS terminal policy", () => {
    expect(POS_TABLET_TERMINAL_ERA168_CANONICAL_POLICY_ID).toBe(
      POS_TABLET_TERMINAL_ERA93_POLICY_ID,
    );
  });

  it("audits in-repo Tablet POS Round 2 wiring", () => {
    const audit = auditPosTabletTerminalSmokeEra168Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_TABLET_TERMINAL_ERA168_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes 44px targets and portrait/landscape wiring", () => {
    const client = readFileSync(join(ROOT, "components/pos/pos-tablet-client.tsx"), "utf8");
    expect(client).toContain("tabletMode");
    expect(client).toContain("subscribeTabletOrientation");
    expect(client).toContain("POS_TABLET_POS_MIN_TOUCH_PX");

    const layout = readFileSync(join(ROOT, "lib/pos/pos-tablet-layout.ts"), "utf8");
    expect(layout).toContain("pos-tablet-portrait");
    expect(layout).toContain("pos-tablet-landscape");

    const manifest = readFileSync(
      join(ROOT, "app/dashboard/pos/tablet/manifest.webmanifest/route.ts"),
      "utf8",
    );
    expect(manifest).toContain("standalone");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosTabletTerminalSmokeEra168ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosTabletTerminalSmokeEra168ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosTabletTerminalSmokeEra168Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.minTouchPx).toBe(44);
    expect(summary.capabilities).toContain("touch_targets_44px");
    expect(summary.capabilities).toContain("portrait_landscape");
    expect(summary.capabilities).toContain("pwa_standalone");
  });
});
