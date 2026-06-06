import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CRM_AUTOMATION_ERA123_CANONICAL_POLICY_ID,
  CRM_AUTOMATION_ERA123_POLICY_ID,
  CRM_AUTOMATION_ERA123_ROUTE,
  CRM_AUTOMATION_ERA123_SERVICE,
  CRM_AUTOMATION_ERA123_SUMMARY_ARTIFACT,
  CRM_AUTOMATION_ERA123_TRIGGERS,
  CRM_AUTOMATION_ERA123_WIRING_PATHS,
} from "@/lib/crm/crm-automation-era123-policy";
import {
  auditCrmAutomationSmokeWiring,
  buildCrmAutomationSmokeEra123Summary,
  resolveCrmAutomationSmokeEra123ProofStatus,
} from "@/lib/crm/crm-automation-smoke-summary";
import { CRM_AUTOMATION_POLICY_ID } from "@/lib/crm/automation-policy";

const ROOT = process.cwd();

describe("crm automation era123", () => {
  it("locks era123 policy and artifact path", () => {
    expect(CRM_AUTOMATION_ERA123_POLICY_ID).toBe("era123-crm-automation-v1");
    expect(CRM_AUTOMATION_ERA123_SUMMARY_ARTIFACT).toBe(
      "artifacts/crm-automation-smoke-summary.json",
    );
    expect(CRM_AUTOMATION_ERA123_ROUTE).toBe("/dashboard/crm/automation");
    expect(CRM_AUTOMATION_ERA123_TRIGGERS).toHaveLength(3);
  });

  it("aligns era123 with canonical CRM automation policy", () => {
    expect(CRM_AUTOMATION_ERA123_CANONICAL_POLICY_ID).toBe(CRM_AUTOMATION_POLICY_ID);
  });

  it("audits in-repo CRM Automation wiring", () => {
    const audit = auditCrmAutomationSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of CRM_AUTOMATION_ERA123_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes win-back birthday favorites wiring", () => {
    const service = readFileSync(join(ROOT, CRM_AUTOMATION_ERA123_SERVICE), "utf8");
    expect(service).toContain("loadCrmAutomationSnapshot");
    expect(service).toContain("runCrmAutomationScan");
    expect(service).toContain("processBirthdayRewardsForOwner");

    const builders = readFileSync(join(ROOT, "lib/crm/automation-builders.ts"), "utf8");
    expect(builders).toContain("buildCrmAutomationLane");
    expect(builders).toContain("favoritesCount");

    const panel = readFileSync(
      join(ROOT, "components/crm/crm-automation-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("crm-automation-panel");
    expect(panel).toContain("Reorder nudges");
    expect(panel).toContain("Run scan now");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveCrmAutomationSmokeEra123ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveCrmAutomationSmokeEra123ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildCrmAutomationSmokeEra123Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.triggers).toContain("favorites");
  });
});
