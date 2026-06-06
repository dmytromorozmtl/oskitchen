import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { KDS_EXPO_VIEW_ERA101_POLICY_ID } from "@/lib/kitchen/kds-expo-view-era101-policy";
import {
  KDS_EXPO_VIEW_ERA176_CANONICAL_POLICY_ID,
  KDS_EXPO_VIEW_ERA176_CAPABILITIES,
  KDS_EXPO_VIEW_ERA176_LANES,
  KDS_EXPO_VIEW_ERA176_POLICY_ID,
  KDS_EXPO_VIEW_ERA176_ROUTE,
  KDS_EXPO_VIEW_ERA176_SUMMARY_ARTIFACT,
  KDS_EXPO_VIEW_ERA176_WIRING_PATHS,
} from "@/lib/kitchen/kds-expo-view-era176-policy";
import {
  auditKdsExpoViewSmokeEra176Wiring,
  buildKdsExpoViewSmokeEra176Summary,
  resolveKdsExpoViewSmokeEra176ProofStatus,
} from "@/lib/kitchen/kds-expo-view-era176-smoke-summary";
import {
  KDS_EXPO_VIEW_POLICY_ID,
  KDS_EXPO_VIEW_ROUTE,
} from "@/lib/kitchen/kds-expo-view-policy";

const ROOT = process.cwd();

describe("kds expo view era176", () => {
  it("locks era176 policy and artifact path", () => {
    expect(KDS_EXPO_VIEW_ERA176_POLICY_ID).toBe("era176-kds-expo-view-v1");
    expect(KDS_EXPO_VIEW_ERA176_SUMMARY_ARTIFACT).toBe(
      "artifacts/kds-expo-view-era176-smoke-summary.json",
    );
    expect(KDS_EXPO_VIEW_ERA176_ROUTE).toBe("/dashboard/kitchen/expo");
    expect(KDS_EXPO_VIEW_ERA176_LANES).toEqual(["ready", "waiting", "delayed"]);
    expect(KDS_EXPO_VIEW_ERA176_WIRING_PATHS).toHaveLength(5);
    expect(KDS_EXPO_VIEW_ERA176_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era176 with canonical KDS Expo View policy", () => {
    expect(KDS_EXPO_VIEW_ERA176_CANONICAL_POLICY_ID).toBe(KDS_EXPO_VIEW_ERA101_POLICY_ID);
    expect(KDS_EXPO_VIEW_POLICY_ID).toBe("kds-expo-view-v1");
    expect(KDS_EXPO_VIEW_ROUTE).toBe(KDS_EXPO_VIEW_ERA176_ROUTE);
  });

  it("audits in-repo KDS Expo View Round 2 wiring", () => {
    const audit = auditKdsExpoViewSmokeEra176Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of KDS_EXPO_VIEW_ERA176_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes ready, waiting, delayed lanes in expo client", () => {
    const client = readFileSync(join(ROOT, "components/kitchen/expo-view-client.tsx"), "utf8");
    expect(client).toContain("kds-expo-view-root");
    expect(client).toContain("kds-expo-lane-${");
    expect(client).toContain("ready:");
    expect(client).toContain("waiting:");
    expect(client).toContain("delayed:");
    expect(client).toContain("kds-expo-ticket");

    const core = readFileSync(join(ROOT, "lib/kitchen/kds-expo-view.ts"), "utf8");
    expect(core).toContain("buildExpoViewSnapshot");
    expect(core).toContain("resolveExpoLane");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveKdsExpoViewSmokeEra176ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveKdsExpoViewSmokeEra176ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildKdsExpoViewSmokeEra176Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.lanes).toEqual(["ready", "waiting", "delayed"]);
    expect(summary.capabilities).toContain("ready_lane");
    expect(summary.capabilities).toContain("expo_handoff");
  });
});
