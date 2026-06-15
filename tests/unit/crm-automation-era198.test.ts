import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CRM_AUTOMATION_ERA123_POLICY_ID,
} from "@/lib/crm/crm-automation-era123-policy";
import {
  CRM_AUTOMATION_ERA198_CANONICAL_POLICY_ID,
  CRM_AUTOMATION_ERA198_POLICY_ID,
  CRM_AUTOMATION_ERA198_ROUTE,
  CRM_AUTOMATION_ERA198_SERVICE,
  CRM_AUTOMATION_ERA198_SUMMARY_ARTIFACT,
  CRM_AUTOMATION_ERA198_TRIGGERS,
  CRM_AUTOMATION_ERA198_WIRING_PATHS,
} from "@/lib/crm/crm-automation-era198-policy";
import {
  auditCrmAutomationSmokeEra198Wiring,
  buildCrmAutomationSmokeEra198Summary,
  resolveCrmAutomationSmokeEra198ProofStatus,
} from "@/lib/crm/crm-automation-era198-smoke-summary";
import {
  CRM_AUTOMATION_POLICY_ID,
  CRM_AUTOMATION_SERVICE,
} from "@/lib/crm/automation-policy";

const ROOT = process.cwd();

describe("crm automation era198", () => {
  it("locks era198 policy and artifact path", () => {
    expect(CRM_AUTOMATION_ERA198_POLICY_ID).toBe("era198-crm-automation-v1");
    expect(CRM_AUTOMATION_ERA198_SUMMARY_ARTIFACT).toBe(
      "artifacts/crm-automation-era198-smoke-summary.json",
    );
    expect(CRM_AUTOMATION_ERA198_ROUTE).toBe("/dashboard/crm/automation");
    expect(CRM_AUTOMATION_ERA198_WIRING_PATHS).toHaveLength(6);
    expect(CRM_AUTOMATION_ERA198_TRIGGERS).toHaveLength(3);
  });

  it("aligns era198 with canonical CRM Automation policy", () => {
    expect(CRM_AUTOMATION_ERA198_CANONICAL_POLICY_ID).toBe(CRM_AUTOMATION_ERA123_POLICY_ID);
    expect(CRM_AUTOMATION_ERA198_SERVICE).toBe(CRM_AUTOMATION_SERVICE);
    expect(CRM_AUTOMATION_POLICY_ID).toBe("crm-automation-v1");
  });

  it("audits in-repo CRM Automation Round 2 wiring", () => {
    const audit = auditCrmAutomationSmokeEra198Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of CRM_AUTOMATION_ERA198_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes win-back birthday favorites wiring", () => {
    const service = readFileSync(join(ROOT, CRM_AUTOMATION_ERA198_SERVICE), "utf8");
    expect(service).toContain("loadCrmAutomationSnapshot");
    expect(service).toContain("loadWinBackCandidates");
    expect(service).toContain("loadFavoritesCandidates");

    const builders = readFileSync(join(ROOT, "lib/crm/automation-builders.ts"), "utf8");
    expect(builders).toContain("buildCrmAutomationSnapshot");
    expect(builders).toContain("buildCrmAutomationQueueItem");

    const panel = readFileSync(
      join(ROOT, "components/crm/crm-automation-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("crm-automation-panel");
    expect(panel).toContain("Birthdays");
    expect(panel).toContain("Favorites");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveCrmAutomationSmokeEra198ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveCrmAutomationSmokeEra198ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildCrmAutomationSmokeEra198Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.triggers).toContain("win-back");
    expect(summary.triggers).toContain("birthday");
  });
});
