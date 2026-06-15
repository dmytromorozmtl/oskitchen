import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_MOBILE_TERMINAL_ERA94_MIN_TOUCH_PX,
  POS_MOBILE_TERMINAL_ERA94_POLICY_ID,
  POS_MOBILE_TERMINAL_ERA94_ROUTE,
  POS_MOBILE_TERMINAL_ERA94_SUMMARY_ARTIFACT,
  POS_MOBILE_TERMINAL_ERA94_WIRING_PATHS,
} from "@/lib/pos/pos-mobile-terminal-era94-policy";
import {
  auditPosMobileTerminalSmokeWiring,
  buildPosMobileTerminalSmokeEra94Summary,
  resolvePosMobileTerminalSmokeEra94ProofStatus,
} from "@/lib/pos/pos-mobile-terminal-smoke-summary";

const ROOT = process.cwd();

describe("pos mobile terminal era94", () => {
  it("locks era94 policy and artifact path", () => {
    expect(POS_MOBILE_TERMINAL_ERA94_POLICY_ID).toBe("era94-pos-mobile-terminal-v1");
    expect(POS_MOBILE_TERMINAL_ERA94_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-mobile-terminal-smoke-summary.json",
    );
    expect(POS_MOBILE_TERMINAL_ERA94_ROUTE).toBe("/dashboard/pos/mobile");
    expect(POS_MOBILE_TERMINAL_ERA94_MIN_TOUCH_PX).toBe(48);
  });

  it("audits in-repo Mobile POS wiring", () => {
    const audit = auditPosMobileTerminalSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_MOBILE_TERMINAL_ERA94_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes swipe and one-hand checkout in mobile client", () => {
    const client = readFileSync(join(ROOT, "components/pos/pos-mobile-client.tsx"), "utf8");
    expect(client).toContain("createPosSwipeHandlers");
    expect(client).toContain("one-hand");
    expect(client).toContain("pos-mobile-cart-sheet");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosMobileTerminalSmokeEra94ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosMobileTerminalSmokeEra94ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosMobileTerminalSmokeEra94Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.minTouchPx).toBe(48);
  });
});
