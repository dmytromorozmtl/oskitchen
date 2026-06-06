import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  AI_LABOR_MANAGER_ERA109_CANONICAL_POLICY_ID,
  AI_LABOR_MANAGER_ERA109_CAPABILITIES,
  AI_LABOR_MANAGER_ERA109_POLICY_ID,
  AI_LABOR_MANAGER_ERA109_ROUTE,
  AI_LABOR_MANAGER_ERA109_SERVICE,
  AI_LABOR_MANAGER_ERA109_SUMMARY_ARTIFACT,
  AI_LABOR_MANAGER_ERA109_WIRING_PATHS,
} from "@/lib/ai/labor-manager-era109-policy";
import {
  auditAiLaborManagerSmokeWiring,
  buildAiLaborManagerSmokeEra109Summary,
  resolveAiLaborManagerSmokeEra109ProofStatus,
} from "@/lib/ai/labor-manager-smoke-summary";
import {
  AI_LABOR_MANAGER_POLICY_ID,
  AI_LABOR_MANAGER_SERVICE,
} from "@/lib/ai/labor-manager-policy";

const ROOT = process.cwd();

describe("ai labor manager era109", () => {
  it("locks era109 policy and artifact path", () => {
    expect(AI_LABOR_MANAGER_ERA109_POLICY_ID).toBe("era109-ai-labor-manager-v1");
    expect(AI_LABOR_MANAGER_ERA109_SUMMARY_ARTIFACT).toBe(
      "artifacts/ai-labor-manager-smoke-summary.json",
    );
    expect(AI_LABOR_MANAGER_ERA109_ROUTE).toBe("/dashboard/staff/labor-manager");
    expect(AI_LABOR_MANAGER_ERA109_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era109 with canonical labor manager policy", () => {
    expect(AI_LABOR_MANAGER_ERA109_CANONICAL_POLICY_ID).toBe(AI_LABOR_MANAGER_POLICY_ID);
    expect(AI_LABOR_MANAGER_ERA109_SERVICE).toBe(AI_LABOR_MANAGER_SERVICE);
  });

  it("audits in-repo AI Labor Manager wiring", () => {
    const audit = auditAiLaborManagerSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of AI_LABOR_MANAGER_ERA109_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes staffing optimization and overtime alert wiring", () => {
    const service = readFileSync(join(ROOT, AI_LABOR_MANAGER_ERA109_SERVICE), "utf8");
    expect(service).toContain("loadLaborManagerSnapshot");
    expect(service).toContain("loadAiSchedulePlan");

    const client = readFileSync(
      join(ROOT, "components/labor/labor-manager-client.tsx"),
      "utf8",
    );
    expect(client).toContain("ai-labor-manager-daily-brief");
    expect(client).toContain("Overtime alerts");
    expect(client).toContain("Staffing optimization");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveAiLaborManagerSmokeEra109ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveAiLaborManagerSmokeEra109ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildAiLaborManagerSmokeEra109Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("overtime_alerts");
  });
});
