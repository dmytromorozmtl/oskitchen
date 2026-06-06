import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CASHIER_ROLE_UI_ERA130_CANONICAL_POLICY_ID,
  CASHIER_ROLE_UI_ERA130_POLICY_ID,
  CASHIER_ROLE_UI_ERA130_ROUTE,
  CASHIER_ROLE_UI_ERA130_SECTIONS,
  CASHIER_ROLE_UI_ERA130_SERVICE,
  CASHIER_ROLE_UI_ERA130_SUMMARY_ARTIFACT,
  CASHIER_ROLE_UI_ERA130_WIRING_PATHS,
} from "@/lib/roles/cashier-role-ui-era130-policy";
import {
  auditCashierRoleUiSmokeWiring,
  buildCashierRoleUiSmokeEra130Summary,
  resolveCashierRoleUiSmokeEra130ProofStatus,
} from "@/lib/roles/cashier-role-ui-smoke-summary";
import { CASHIER_ROLE_UI_POLICY_ID } from "@/lib/roles/cashier-ui-policy";

const ROOT = process.cwd();

describe("cashier role ui era130", () => {
  it("locks era130 policy and artifact path", () => {
    expect(CASHIER_ROLE_UI_ERA130_POLICY_ID).toBe("era130-role-ui-cashier-v1");
    expect(CASHIER_ROLE_UI_ERA130_SUMMARY_ARTIFACT).toBe(
      "artifacts/cashier-role-ui-smoke-summary.json",
    );
    expect(CASHIER_ROLE_UI_ERA130_ROUTE).toBe("/dashboard/roles/cashier");
    expect(CASHIER_ROLE_UI_ERA130_SECTIONS).toHaveLength(3);
  });

  it("aligns era130 with canonical cashier role UI policy", () => {
    expect(CASHIER_ROLE_UI_ERA130_CANONICAL_POLICY_ID).toBe(CASHIER_ROLE_UI_POLICY_ID);
  });

  it("audits in-repo Cashier Role UI wiring", () => {
    const audit = auditCashierRoleUiSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of CASHIER_ROLE_UI_ERA130_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes register KPIs cashier briefing shortcuts wiring", () => {
    const service = readFileSync(join(ROOT, CASHIER_ROLE_UI_ERA130_SERVICE), "utf8");
    expect(service).toContain("loadCashierRoleUiSnapshot");
    expect(service).toContain("buildCashierRoleKpisFromToday");
    expect(service).toContain('persona: "cashier"');

    const builders = readFileSync(join(ROOT, "lib/roles/cashier-ui-builders.ts"), "utf8");
    expect(builders).toContain("CASHIER_ROLE_SHORTCUTS");
    expect(builders).toContain("/dashboard/pos/terminal");

    const panel = readFileSync(
      join(ROOT, "components/roles/cashier-role-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("cashier-role-panel");
    expect(panel).toContain("Cashier shortcuts");
    expect(panel).toContain("Ranked register priorities");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveCashierRoleUiSmokeEra130ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveCashierRoleUiSmokeEra130ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildCashierRoleUiSmokeEra130Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.sections).toContain("shortcuts");
  });
});
