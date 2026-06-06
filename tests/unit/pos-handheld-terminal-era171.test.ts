import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { HANDHELD_KDS_ROUTE } from "@/lib/pos/handheld-ordering";
import { POS_HANDHELD_TERMINAL_ERA96_POLICY_ID } from "@/lib/pos/pos-handheld-terminal-era96-policy";
import {
  POS_HANDHELD_TERMINAL_ERA171_CANONICAL_POLICY_ID,
  POS_HANDHELD_TERMINAL_ERA171_CAPABILITIES,
  POS_HANDHELD_TERMINAL_ERA171_KDS_ROUTE,
  POS_HANDHELD_TERMINAL_ERA171_MIN_TOUCH_PX,
  POS_HANDHELD_TERMINAL_ERA171_POLICY_ID,
  POS_HANDHELD_TERMINAL_ERA171_ROUTE,
  POS_HANDHELD_TERMINAL_ERA171_SUMMARY_ARTIFACT,
  POS_HANDHELD_TERMINAL_ERA171_WIRING_PATHS,
} from "@/lib/pos/pos-handheld-terminal-era171-policy";
import {
  auditPosHandheldTerminalSmokeEra171Wiring,
  buildPosHandheldTerminalSmokeEra171Summary,
  resolvePosHandheldTerminalSmokeEra171ProofStatus,
} from "@/lib/pos/pos-handheld-terminal-era171-smoke-summary";

const ROOT = process.cwd();

describe("pos handheld terminal era171", () => {
  it("locks era171 policy and artifact path", () => {
    expect(POS_HANDHELD_TERMINAL_ERA171_POLICY_ID).toBe("era171-pos-handheld-terminal-v1");
    expect(POS_HANDHELD_TERMINAL_ERA171_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-handheld-terminal-era171-smoke-summary.json",
    );
    expect(POS_HANDHELD_TERMINAL_ERA171_ROUTE).toBe("/dashboard/pos/handheld");
    expect(POS_HANDHELD_TERMINAL_ERA171_KDS_ROUTE).toBe("/dashboard/kitchen");
    expect(POS_HANDHELD_TERMINAL_ERA171_MIN_TOUCH_PX).toBe(48);
    expect(POS_HANDHELD_TERMINAL_ERA171_WIRING_PATHS).toHaveLength(7);
    expect(POS_HANDHELD_TERMINAL_ERA171_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era171 with canonical Handheld POS terminal policy", () => {
    expect(POS_HANDHELD_TERMINAL_ERA171_CANONICAL_POLICY_ID).toBe(
      POS_HANDHELD_TERMINAL_ERA96_POLICY_ID,
    );
    expect(HANDHELD_KDS_ROUTE).toBe(POS_HANDHELD_TERMINAL_ERA171_KDS_ROUTE);
  });

  it("audits in-repo Handheld POS Round 2 wiring", () => {
    const audit = auditPosHandheldTerminalSmokeEra171Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_HANDHELD_TERMINAL_ERA171_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes table select, waiter ordering, and KDS fire wiring", () => {
    const client = readFileSync(join(ROOT, "components/pos/handheld-ordering-client.tsx"), "utf8");
    expect(client).toContain("fireHandheldToKdsAction");
    expect(client).toContain("handheld-fire-kds");
    expect(client).toContain("handheld-table-tile");

    const kdsFire = readFileSync(join(ROOT, "services/pos/handheld-kds-fire-service.ts"), "utf8");
    expect(kdsFire).toContain("fireHandheldOrderToKds");
    expect(kdsFire).toContain("enqueueKitchenRoutingForPosOrder");

    const ordering = readFileSync(join(ROOT, "lib/pos/handheld-ordering.ts"), "utf8");
    expect(ordering).toContain("findOpenTabForTable");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosHandheldTerminalSmokeEra171ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosHandheldTerminalSmokeEra171ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosHandheldTerminalSmokeEra171Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.kdsRoute).toBe("/dashboard/kitchen");
    expect(summary.capabilities).toContain("waiter_ordering");
    expect(summary.capabilities).toContain("kds_fire");
    expect(summary.capabilities).toContain("tab_sync");
  });
});
