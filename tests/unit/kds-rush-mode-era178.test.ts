import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { KDS_RUSH_MODE_ERA103_POLICY_ID } from "@/lib/kitchen/kds-rush-mode-era103-policy";
import {
  KDS_RUSH_MODE_ERA178_CANONICAL_POLICY_ID,
  KDS_RUSH_MODE_ERA178_CAPABILITIES,
  KDS_RUSH_MODE_ERA178_COMPONENT,
  KDS_RUSH_MODE_ERA178_POLICY_ID,
  KDS_RUSH_MODE_ERA178_RUSH_LEVELS,
  KDS_RUSH_MODE_ERA178_SUMMARY_ARTIFACT,
  KDS_RUSH_MODE_ERA178_WIRING_PATHS,
} from "@/lib/kitchen/kds-rush-mode-era178-policy";
import {
  auditKdsRushModeSmokeEra178Wiring,
  buildKdsRushModeSmokeEra178Summary,
  resolveKdsRushModeSmokeEra178ProofStatus,
} from "@/lib/kitchen/kds-rush-mode-era178-smoke-summary";
import {
  KDS_RUSH_MODE_COMPONENT,
  KDS_RUSH_MODE_POLICY_ID,
} from "@/lib/kitchen/kds-rush-mode-policy";

const ROOT = process.cwd();

describe("kds rush mode era178", () => {
  it("locks era178 policy and artifact path", () => {
    expect(KDS_RUSH_MODE_ERA178_POLICY_ID).toBe("era178-kds-rush-mode-v1");
    expect(KDS_RUSH_MODE_ERA178_SUMMARY_ARTIFACT).toBe(
      "artifacts/kds-rush-mode-era178-smoke-summary.json",
    );
    expect(KDS_RUSH_MODE_ERA178_COMPONENT).toBe("components/kitchen/rush-mode.tsx");
    expect(KDS_RUSH_MODE_ERA178_RUSH_LEVELS).toEqual(["normal", "building", "rush"]);
    expect(KDS_RUSH_MODE_ERA178_WIRING_PATHS).toHaveLength(5);
    expect(KDS_RUSH_MODE_ERA178_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era178 with canonical KDS Rush Mode policy", () => {
    expect(KDS_RUSH_MODE_ERA178_CANONICAL_POLICY_ID).toBe(KDS_RUSH_MODE_ERA103_POLICY_ID);
    expect(KDS_RUSH_MODE_POLICY_ID).toBe("kds-rush-mode-v1");
    expect(KDS_RUSH_MODE_COMPONENT).toBe(KDS_RUSH_MODE_ERA178_COMPONENT);
  });

  it("audits in-repo KDS Rush Mode Round 2 wiring", () => {
    const audit = auditKdsRushModeSmokeEra178Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of KDS_RUSH_MODE_ERA178_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes peak detection, routing, and sound alert wiring", () => {
    const rushMode = readFileSync(join(ROOT, KDS_RUSH_MODE_ERA178_COMPONENT), "utf8");
    expect(rushMode).toContain("kds-rush-mode");
    expect(rushMode).toContain("kds-rush-peak-signals");
    expect(rushMode).toContain("kds-rush-route-");

    const core = readFileSync(join(ROOT, "lib/kitchen/kds-rush-mode.ts"), "utf8");
    expect(core).toContain("detectKdsRushLevel");
    expect(core).toContain("buildKdsRushPriorityRoutes");

    const kdsService = readFileSync(
      join(ROOT, "components/kitchen/kds-daily-service.tsx"),
      "utf8",
    );
    expect(kdsService).toContain("RushMode");
    expect(kdsService).toContain("playKdsRushModeAlert");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveKdsRushModeSmokeEra178ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveKdsRushModeSmokeEra178ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildKdsRushModeSmokeEra178Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.rushLevels).toEqual(["normal", "building", "rush"]);
    expect(summary.capabilities).toContain("peak_detection");
    expect(summary.capabilities).toContain("sound_alerts");
  });
});
