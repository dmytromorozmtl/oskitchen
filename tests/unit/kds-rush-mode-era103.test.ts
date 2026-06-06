import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_RUSH_MODE_ERA103_COMPONENT,
  KDS_RUSH_MODE_ERA103_POLICY_ID,
  KDS_RUSH_MODE_ERA103_RUSH_LEVELS,
  KDS_RUSH_MODE_ERA103_SUMMARY_ARTIFACT,
  KDS_RUSH_MODE_ERA103_WIRING_PATHS,
} from "@/lib/kitchen/kds-rush-mode-era103-policy";
import {
  auditKdsRushModeSmokeWiring,
  buildKdsRushModeSmokeEra103Summary,
  resolveKdsRushModeSmokeEra103ProofStatus,
} from "@/lib/kitchen/kds-rush-mode-smoke-summary";
import {
  KDS_RUSH_MODE_COMPONENT,
  KDS_RUSH_MODE_POLICY_ID,
} from "@/lib/kitchen/kds-rush-mode-policy";

const ROOT = process.cwd();

describe("kds rush mode era103", () => {
  it("locks era103 policy and artifact path", () => {
    expect(KDS_RUSH_MODE_ERA103_POLICY_ID).toBe("era103-kds-rush-mode-v1");
    expect(KDS_RUSH_MODE_ERA103_SUMMARY_ARTIFACT).toBe(
      "artifacts/kds-rush-mode-smoke-summary.json",
    );
    expect(KDS_RUSH_MODE_ERA103_COMPONENT).toBe("components/kitchen/rush-mode.tsx");
    expect(KDS_RUSH_MODE_ERA103_RUSH_LEVELS).toEqual(["normal", "building", "rush"]);
  });

  it("aligns era103 component with canonical rush mode policy", () => {
    expect(KDS_RUSH_MODE_POLICY_ID).toBe("kds-rush-mode-v1");
    expect(KDS_RUSH_MODE_COMPONENT).toBe(KDS_RUSH_MODE_ERA103_COMPONENT);
  });

  it("audits in-repo KDS Rush Mode wiring", () => {
    const audit = auditKdsRushModeSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of KDS_RUSH_MODE_ERA103_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes peak detection, routing, and sound alert wiring", () => {
    const rushMode = readFileSync(join(ROOT, KDS_RUSH_MODE_ERA103_COMPONENT), "utf8");
    expect(rushMode).toContain("kds-rush-mode");
    expect(rushMode).toContain("kds-rush-peak-signals");

    const kdsService = readFileSync(
      join(ROOT, "components/kitchen/kds-daily-service.tsx"),
      "utf8",
    );
    expect(kdsService).toContain("RushMode");
    expect(kdsService).toContain("playKdsRushModeAlert");

    const sounds = readFileSync(join(ROOT, "lib/kitchen/kds-realtime-sounds.ts"), "utf8");
    expect(sounds).toContain("playKdsRushModeAlert");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveKdsRushModeSmokeEra103ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveKdsRushModeSmokeEra103ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildKdsRushModeSmokeEra103Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.rushLevels).toEqual(["normal", "building", "rush"]);
  });
});
