import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CHEF_ROLE_UI_ERA129_CANONICAL_POLICY_ID,
  CHEF_ROLE_UI_ERA129_POLICY_ID,
  CHEF_ROLE_UI_ERA129_ROUTE,
  CHEF_ROLE_UI_ERA129_SECTIONS,
  CHEF_ROLE_UI_ERA129_SERVICE,
  CHEF_ROLE_UI_ERA129_SUMMARY_ARTIFACT,
  CHEF_ROLE_UI_ERA129_WIRING_PATHS,
} from "@/lib/roles/chef-role-ui-era129-policy";
import {
  auditChefRoleUiSmokeWiring,
  buildChefRoleUiSmokeEra129Summary,
  resolveChefRoleUiSmokeEra129ProofStatus,
} from "@/lib/roles/chef-role-ui-smoke-summary";
import { CHEF_ROLE_UI_POLICY_ID } from "@/lib/roles/chef-ui-policy";

const ROOT = process.cwd();

describe("chef role ui era129", () => {
  it("locks era129 policy and artifact path", () => {
    expect(CHEF_ROLE_UI_ERA129_POLICY_ID).toBe("era129-role-ui-chef-v1");
    expect(CHEF_ROLE_UI_ERA129_SUMMARY_ARTIFACT).toBe(
      "artifacts/chef-role-ui-smoke-summary.json",
    );
    expect(CHEF_ROLE_UI_ERA129_ROUTE).toBe("/dashboard/roles/chef");
    expect(CHEF_ROLE_UI_ERA129_SECTIONS).toHaveLength(3);
  });

  it("aligns era129 with canonical chef role UI policy", () => {
    expect(CHEF_ROLE_UI_ERA129_CANONICAL_POLICY_ID).toBe(CHEF_ROLE_UI_POLICY_ID);
  });

  it("audits in-repo Chef Role UI wiring", () => {
    const audit = auditChefRoleUiSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of CHEF_ROLE_UI_ERA129_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes line KPIs kitchen briefing shortcuts wiring", () => {
    const service = readFileSync(join(ROOT, CHEF_ROLE_UI_ERA129_SERVICE), "utf8");
    expect(service).toContain("loadChefRoleUiSnapshot");
    expect(service).toContain("buildChefRoleKpisFromProduction");
    expect(service).toContain('persona: "kitchen"');

    const builders = readFileSync(join(ROOT, "lib/roles/chef-ui-builders.ts"), "utf8");
    expect(builders).toContain("CHEF_ROLE_SHORTCUTS");
    expect(builders).toContain("/dashboard/kitchen/production");

    const panel = readFileSync(
      join(ROOT, "components/roles/chef-role-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("chef-role-panel");
    expect(panel).toContain("Chef shortcuts");
    expect(panel).toContain("Ranked line priorities");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveChefRoleUiSmokeEra129ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveChefRoleUiSmokeEra129ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildChefRoleUiSmokeEra129Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.sections).toContain("shortcuts");
  });
});
