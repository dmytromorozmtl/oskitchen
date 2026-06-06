import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MANAGER_ROLE_UI_ERA128_CANONICAL_POLICY_ID,
  MANAGER_ROLE_UI_ERA128_POLICY_ID,
  MANAGER_ROLE_UI_ERA128_ROUTE,
  MANAGER_ROLE_UI_ERA128_SECTIONS,
  MANAGER_ROLE_UI_ERA128_SERVICE,
  MANAGER_ROLE_UI_ERA128_SUMMARY_ARTIFACT,
  MANAGER_ROLE_UI_ERA128_WIRING_PATHS,
} from "@/lib/roles/manager-role-ui-era128-policy";
import {
  auditManagerRoleUiSmokeWiring,
  buildManagerRoleUiSmokeEra128Summary,
  resolveManagerRoleUiSmokeEra128ProofStatus,
} from "@/lib/roles/manager-role-ui-smoke-summary";
import { MANAGER_ROLE_UI_POLICY_ID } from "@/lib/roles/manager-ui-policy";

const ROOT = process.cwd();

describe("manager role ui era128", () => {
  it("locks era128 policy and artifact path", () => {
    expect(MANAGER_ROLE_UI_ERA128_POLICY_ID).toBe("era128-role-ui-manager-v1");
    expect(MANAGER_ROLE_UI_ERA128_SUMMARY_ARTIFACT).toBe(
      "artifacts/manager-role-ui-smoke-summary.json",
    );
    expect(MANAGER_ROLE_UI_ERA128_ROUTE).toBe("/dashboard/roles/manager");
    expect(MANAGER_ROLE_UI_ERA128_SECTIONS).toHaveLength(3);
  });

  it("aligns era128 with canonical manager role UI policy", () => {
    expect(MANAGER_ROLE_UI_ERA128_CANONICAL_POLICY_ID).toBe(MANAGER_ROLE_UI_POLICY_ID);
  });

  it("audits in-repo Manager Role UI wiring", () => {
    const audit = auditManagerRoleUiSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of MANAGER_ROLE_UI_ERA128_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes operational KPIs briefing shortcuts wiring", () => {
    const service = readFileSync(join(ROOT, MANAGER_ROLE_UI_ERA128_SERVICE), "utf8");
    expect(service).toContain("loadManagerRoleUiSnapshot");
    expect(service).toContain("buildManagerRoleKpisFromExecutive");
    expect(service).toContain('persona: "manager"');

    const builders = readFileSync(join(ROOT, "lib/roles/manager-ui-builders.ts"), "utf8");
    expect(builders).toContain("MANAGER_ROLE_SHORTCUTS");
    expect(builders).toContain("/dashboard/kitchen/manager");

    const panel = readFileSync(
      join(ROOT, "components/roles/manager-role-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("manager-role-panel");
    expect(panel).toContain("Manager shortcuts");
    expect(panel).toContain("Ranked shift priorities");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveManagerRoleUiSmokeEra128ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveManagerRoleUiSmokeEra128ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildManagerRoleUiSmokeEra128Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.sections).toContain("shortcuts");
  });
});
