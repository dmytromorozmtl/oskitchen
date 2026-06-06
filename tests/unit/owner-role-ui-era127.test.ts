import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  OWNER_ROLE_UI_ERA127_CANONICAL_POLICY_ID,
  OWNER_ROLE_UI_ERA127_POLICY_ID,
  OWNER_ROLE_UI_ERA127_ROUTE,
  OWNER_ROLE_UI_ERA127_SECTIONS,
  OWNER_ROLE_UI_ERA127_SERVICE,
  OWNER_ROLE_UI_ERA127_SUMMARY_ARTIFACT,
  OWNER_ROLE_UI_ERA127_WIRING_PATHS,
} from "@/lib/roles/owner-role-ui-era127-policy";
import {
  auditOwnerRoleUiSmokeWiring,
  buildOwnerRoleUiSmokeEra127Summary,
  resolveOwnerRoleUiSmokeEra127ProofStatus,
} from "@/lib/roles/owner-role-ui-smoke-summary";
import { OWNER_ROLE_UI_POLICY_ID } from "@/lib/roles/owner-ui-policy";

const ROOT = process.cwd();

describe("owner role ui era127", () => {
  it("locks era127 policy and artifact path", () => {
    expect(OWNER_ROLE_UI_ERA127_POLICY_ID).toBe("era127-role-ui-owner-v1");
    expect(OWNER_ROLE_UI_ERA127_SUMMARY_ARTIFACT).toBe(
      "artifacts/owner-role-ui-smoke-summary.json",
    );
    expect(OWNER_ROLE_UI_ERA127_ROUTE).toBe("/dashboard/roles/owner");
    expect(OWNER_ROLE_UI_ERA127_SECTIONS).toHaveLength(3);
  });

  it("aligns era127 with canonical owner role UI policy", () => {
    expect(OWNER_ROLE_UI_ERA127_CANONICAL_POLICY_ID).toBe(OWNER_ROLE_UI_POLICY_ID);
  });

  it("audits in-repo Owner Role UI wiring", () => {
    const audit = auditOwnerRoleUiSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of OWNER_ROLE_UI_ERA127_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes KPIs briefing shortcuts wiring", () => {
    const service = readFileSync(join(ROOT, OWNER_ROLE_UI_ERA127_SERVICE), "utf8");
    expect(service).toContain("loadOwnerRoleUiSnapshot");
    expect(service).toContain("buildOwnerRoleKpisFromExecutive");
    expect(service).toContain("heroTiles");

    const builders = readFileSync(join(ROOT, "lib/roles/owner-ui-builders.ts"), "utf8");
    expect(builders).toContain("OWNER_ROLE_SHORTCUTS");
    expect(builders).toContain("/dashboard/executive");

    const panel = readFileSync(
      join(ROOT, "components/roles/owner-role-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("owner-role-panel");
    expect(panel).toContain("Owner shortcuts");
    expect(panel).toContain("Priority tiles");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveOwnerRoleUiSmokeEra127ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveOwnerRoleUiSmokeEra127ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildOwnerRoleUiSmokeEra127Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.sections).toContain("shortcuts");
  });
});
