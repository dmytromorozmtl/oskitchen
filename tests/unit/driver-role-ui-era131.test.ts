import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DRIVER_ROLE_UI_ERA131_CANONICAL_POLICY_ID,
  DRIVER_ROLE_UI_ERA131_POLICY_ID,
  DRIVER_ROLE_UI_ERA131_ROUTE,
  DRIVER_ROLE_UI_ERA131_SECTIONS,
  DRIVER_ROLE_UI_ERA131_SERVICE,
  DRIVER_ROLE_UI_ERA131_SUMMARY_ARTIFACT,
  DRIVER_ROLE_UI_ERA131_WIRING_PATHS,
} from "@/lib/roles/driver-role-ui-era131-policy";
import {
  auditDriverRoleUiSmokeWiring,
  buildDriverRoleUiSmokeEra131Summary,
  resolveDriverRoleUiSmokeEra131ProofStatus,
} from "@/lib/roles/driver-role-ui-smoke-summary";
import { DRIVER_ROLE_UI_POLICY_ID } from "@/lib/roles/driver-ui-policy";

const ROOT = process.cwd();

describe("driver role ui era131", () => {
  it("locks era131 policy and artifact path", () => {
    expect(DRIVER_ROLE_UI_ERA131_POLICY_ID).toBe("era131-role-ui-driver-v1");
    expect(DRIVER_ROLE_UI_ERA131_SUMMARY_ARTIFACT).toBe(
      "artifacts/driver-role-ui-smoke-summary.json",
    );
    expect(DRIVER_ROLE_UI_ERA131_ROUTE).toBe("/dashboard/roles/driver");
    expect(DRIVER_ROLE_UI_ERA131_SECTIONS).toHaveLength(3);
  });

  it("aligns era131 with canonical driver role UI policy", () => {
    expect(DRIVER_ROLE_UI_ERA131_CANONICAL_POLICY_ID).toBe(DRIVER_ROLE_UI_POLICY_ID);
  });

  it("audits in-repo Driver Role UI wiring", () => {
    const audit = auditDriverRoleUiSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of DRIVER_ROLE_UI_ERA131_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes route KPIs delivery signals shortcuts wiring", () => {
    const service = readFileSync(join(ROOT, DRIVER_ROLE_UI_ERA131_SERVICE), "utf8");
    expect(service).toContain("loadDriverRoleUiSnapshot");
    expect(service).toContain("loadRouteOverviewKpis");
    expect(service).toContain("loadPackingDeliveryAnalytics");

    const builders = readFileSync(join(ROOT, "lib/roles/driver-ui-builders.ts"), "utf8");
    expect(builders).toContain("DRIVER_ROLE_SHORTCUTS");
    expect(builders).toContain("/dashboard/routes/driver");

    const panel = readFileSync(
      join(ROOT, "components/roles/driver-role-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("driver-role-panel");
    expect(panel).toContain("Driver shortcuts");
    expect(panel).toContain("Ranked delivery priorities");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveDriverRoleUiSmokeEra131ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveDriverRoleUiSmokeEra131ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildDriverRoleUiSmokeEra131Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.sections).toContain("shortcuts");
  });
});
