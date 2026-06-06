import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DARK_MODE_EVERYWHERE_ERA134_AUDITED_MODULES,
  DARK_MODE_EVERYWHERE_ERA134_CANONICAL_POLICY_ID,
  DARK_MODE_EVERYWHERE_ERA134_POLICY_ID,
  DARK_MODE_EVERYWHERE_ERA134_ROLE_MODULES,
  DARK_MODE_EVERYWHERE_ERA134_SERVICE,
  DARK_MODE_EVERYWHERE_ERA134_SUMMARY_ARTIFACT,
  DARK_MODE_EVERYWHERE_ERA134_SURFACES,
  DARK_MODE_EVERYWHERE_ERA134_WIRING_PATHS,
} from "@/lib/design/dark-mode-everywhere-era134-policy";
import {
  auditDarkModeEverywhereSmokeWiring,
  buildDarkModeEverywhereSmokeEra134Summary,
  resolveDarkModeEverywhereSmokeEra134ProofStatus,
} from "@/lib/design/dark-mode-everywhere-smoke-summary";
import { auditDarkModeEverywhere } from "@/lib/design/dark-mode-everywhere-audit-policy";
import { DARK_MODE_EVERYWHERE_POLICY_ID } from "@/lib/design/dark-mode-everywhere-policy";
import { loadDarkModeEverywhereSnapshot } from "@/services/design/dark-mode-everywhere-service";

const ROOT = process.cwd();

describe("dark mode everywhere era134", () => {
  it("locks era134 policy and artifact path", () => {
    expect(DARK_MODE_EVERYWHERE_ERA134_POLICY_ID).toBe("era134-dark-mode-everywhere-v1");
    expect(DARK_MODE_EVERYWHERE_ERA134_SUMMARY_ARTIFACT).toBe(
      "artifacts/dark-mode-everywhere-smoke-summary.json",
    );
    expect(DARK_MODE_EVERYWHERE_ERA134_SURFACES).toHaveLength(3);
    expect(DARK_MODE_EVERYWHERE_ERA134_ROLE_MODULES.length).toBeGreaterThanOrEqual(12);
    expect(DARK_MODE_EVERYWHERE_ERA134_AUDITED_MODULES.length).toBeGreaterThan(
      DARK_MODE_EVERYWHERE_ERA134_ROLE_MODULES.length,
    );
  });

  it("aligns era134 with canonical dark mode everywhere policy", () => {
    expect(DARK_MODE_EVERYWHERE_ERA134_CANONICAL_POLICY_ID).toBe(DARK_MODE_EVERYWHERE_POLICY_ID);
  });

  it("audits in-repo Dark Mode Everywhere wiring", () => {
    const audit = auditDarkModeEverywhereSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of DARK_MODE_EVERYWHERE_ERA134_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes shell roles leadership dark parity wiring", () => {
    const patterns = readFileSync(
      join(ROOT, "lib/design/dark-mode-everywhere-patterns.ts"),
      "utf8",
    );
    expect(patterns).toContain("ROLE_HERO_CARD_CLASS");
    expect(patterns).toContain("dark:bg-amber-950");

    const panel = readFileSync(join(ROOT, "components/roles/owner-role-panel.tsx"), "utf8");
    expect(panel).toContain("owner-role-panel");
    expect(panel).toContain("roleTileToneClass");

    const report = auditDarkModeEverywhere(ROOT);
    expect(report.passed).toBe(true);
    expect(report.legacyDarkBridgePresent).toBe(true);

    const snapshot = loadDarkModeEverywhereSnapshot();
    expect(snapshot.healthScore).toBe(100);
    expect(snapshot.passed).toBe(true);
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveDarkModeEverywhereSmokeEra134ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveDarkModeEverywhereSmokeEra134ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildDarkModeEverywhereSmokeEra134Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.surfaces).toContain("roles");
  });
});
