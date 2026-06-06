import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { POS_MOBILE_TERMINAL_ERA94_POLICY_ID } from "@/lib/pos/pos-mobile-terminal-era94-policy";
import {
  POS_MOBILE_TERMINAL_ERA169_CANONICAL_POLICY_ID,
  POS_MOBILE_TERMINAL_ERA169_CAPABILITIES,
  POS_MOBILE_TERMINAL_ERA169_MIN_TOUCH_PX,
  POS_MOBILE_TERMINAL_ERA169_POLICY_ID,
  POS_MOBILE_TERMINAL_ERA169_ROUTE,
  POS_MOBILE_TERMINAL_ERA169_SUMMARY_ARTIFACT,
  POS_MOBILE_TERMINAL_ERA169_WIRING_PATHS,
} from "@/lib/pos/pos-mobile-terminal-era169-policy";
import {
  auditPosMobileTerminalSmokeEra169Wiring,
  buildPosMobileTerminalSmokeEra169Summary,
  resolvePosMobileTerminalSmokeEra169ProofStatus,
} from "@/lib/pos/pos-mobile-terminal-era169-smoke-summary";

const ROOT = process.cwd();

describe("pos mobile terminal era169", () => {
  it("locks era169 policy and artifact path", () => {
    expect(POS_MOBILE_TERMINAL_ERA169_POLICY_ID).toBe("era169-pos-mobile-terminal-v1");
    expect(POS_MOBILE_TERMINAL_ERA169_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-mobile-terminal-era169-smoke-summary.json",
    );
    expect(POS_MOBILE_TERMINAL_ERA169_ROUTE).toBe("/dashboard/pos/mobile");
    expect(POS_MOBILE_TERMINAL_ERA169_MIN_TOUCH_PX).toBe(48);
    expect(POS_MOBILE_TERMINAL_ERA169_WIRING_PATHS).toHaveLength(7);
    expect(POS_MOBILE_TERMINAL_ERA169_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era169 with canonical Mobile POS terminal policy", () => {
    expect(POS_MOBILE_TERMINAL_ERA169_CANONICAL_POLICY_ID).toBe(
      POS_MOBILE_TERMINAL_ERA94_POLICY_ID,
    );
  });

  it("audits in-repo Mobile POS Round 2 wiring", () => {
    const audit = auditPosMobileTerminalSmokeEra169Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_MOBILE_TERMINAL_ERA169_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes swipe gestures and one-hand checkout wiring", () => {
    const gestures = readFileSync(join(ROOT, "lib/pos/pos-mobile-gestures.ts"), "utf8");
    expect(gestures).toContain("detectPosSwipe");
    expect(gestures).toContain("createPosSwipeHandlers");

    const client = readFileSync(join(ROOT, "components/pos/pos-mobile-client.tsx"), "utf8");
    expect(client).toContain("createPosSwipeHandlers");
    expect(client).toContain("one-hand");
    expect(client).toContain("pos-mobile-cart-sheet");

    const manifest = readFileSync(
      join(ROOT, "app/dashboard/pos/mobile/manifest.webmanifest/route.ts"),
      "utf8",
    );
    expect(manifest).toContain("standalone");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosMobileTerminalSmokeEra169ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosMobileTerminalSmokeEra169ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosMobileTerminalSmokeEra169Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.minTouchPx).toBe(48);
    expect(summary.capabilities).toContain("swipe_gestures");
    expect(summary.capabilities).toContain("one_hand_checkout");
    expect(summary.capabilities).toContain("pwa_standalone");
  });
});
