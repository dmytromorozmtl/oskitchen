import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_EXPO_VIEW_ERA101_LANES,
  KDS_EXPO_VIEW_ERA101_POLICY_ID,
  KDS_EXPO_VIEW_ERA101_ROUTE,
  KDS_EXPO_VIEW_ERA101_SUMMARY_ARTIFACT,
  KDS_EXPO_VIEW_ERA101_WIRING_PATHS,
} from "@/lib/kitchen/kds-expo-view-era101-policy";
import {
  auditKdsExpoViewSmokeWiring,
  buildKdsExpoViewSmokeEra101Summary,
  resolveKdsExpoViewSmokeEra101ProofStatus,
} from "@/lib/kitchen/kds-expo-view-smoke-summary";
import {
  KDS_EXPO_VIEW_POLICY_ID,
  KDS_EXPO_VIEW_ROUTE,
} from "@/lib/kitchen/kds-expo-view-policy";

const ROOT = process.cwd();

describe("kds expo view era101", () => {
  it("locks era101 policy and artifact path", () => {
    expect(KDS_EXPO_VIEW_ERA101_POLICY_ID).toBe("era101-kds-expo-view-v1");
    expect(KDS_EXPO_VIEW_ERA101_SUMMARY_ARTIFACT).toBe(
      "artifacts/kds-expo-view-smoke-summary.json",
    );
    expect(KDS_EXPO_VIEW_ERA101_ROUTE).toBe("/dashboard/kitchen/expo");
    expect(KDS_EXPO_VIEW_ERA101_LANES).toEqual(["ready", "waiting", "delayed"]);
  });

  it("aligns era101 route with canonical expo view policy", () => {
    expect(KDS_EXPO_VIEW_POLICY_ID).toBe("kds-expo-view-v1");
    expect(KDS_EXPO_VIEW_ROUTE).toBe(KDS_EXPO_VIEW_ERA101_ROUTE);
  });

  it("audits in-repo KDS Expo View wiring", () => {
    const audit = auditKdsExpoViewSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of KDS_EXPO_VIEW_ERA101_WIRING_PATHS) {
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
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveKdsExpoViewSmokeEra101ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveKdsExpoViewSmokeEra101ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildKdsExpoViewSmokeEra101Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.lanes).toEqual(["ready", "waiting", "delayed"]);
  });
});
