import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_HANDHELD_TERMINAL_ERA96_KDS_ROUTE,
  POS_HANDHELD_TERMINAL_ERA96_MIN_TOUCH_PX,
  POS_HANDHELD_TERMINAL_ERA96_POLICY_ID,
  POS_HANDHELD_TERMINAL_ERA96_ROUTE,
  POS_HANDHELD_TERMINAL_ERA96_SUMMARY_ARTIFACT,
  POS_HANDHELD_TERMINAL_ERA96_WIRING_PATHS,
} from "@/lib/pos/pos-handheld-terminal-era96-policy";
import {
  auditPosHandheldTerminalSmokeWiring,
  buildPosHandheldTerminalSmokeEra96Summary,
  resolvePosHandheldTerminalSmokeEra96ProofStatus,
} from "@/lib/pos/pos-handheld-terminal-smoke-summary";
import { HANDHELD_KDS_ROUTE } from "@/lib/pos/handheld-ordering";

const ROOT = process.cwd();

describe("pos handheld terminal era96", () => {
  it("locks era96 policy and artifact path", () => {
    expect(POS_HANDHELD_TERMINAL_ERA96_POLICY_ID).toBe("era96-pos-handheld-terminal-v1");
    expect(POS_HANDHELD_TERMINAL_ERA96_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-handheld-terminal-smoke-summary.json",
    );
    expect(POS_HANDHELD_TERMINAL_ERA96_ROUTE).toBe("/dashboard/pos/handheld");
    expect(POS_HANDHELD_TERMINAL_ERA96_KDS_ROUTE).toBe("/dashboard/kitchen");
    expect(POS_HANDHELD_TERMINAL_ERA96_MIN_TOUCH_PX).toBe(48);
  });

  it("aligns era96 KDS route with canonical handheld ordering module", () => {
    expect(HANDHELD_KDS_ROUTE).toBe(POS_HANDHELD_TERMINAL_ERA96_KDS_ROUTE);
  });

  it("audits in-repo Handheld POS wiring", () => {
    const audit = auditPosHandheldTerminalSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_HANDHELD_TERMINAL_ERA96_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes table → KDS fire path in handheld client", () => {
    const client = readFileSync(join(ROOT, "components/pos/handheld-ordering-client.tsx"), "utf8");
    expect(client).toContain("fireHandheldToKdsAction");
    expect(client).toContain("handheld-fire-kds");
    expect(client).toContain("handheld-kds-link");
    expect(client).toContain("handheld-table-tile");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosHandheldTerminalSmokeEra96ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosHandheldTerminalSmokeEra96ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosHandheldTerminalSmokeEra96Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.kdsRoute).toBe("/dashboard/kitchen");
  });
});
