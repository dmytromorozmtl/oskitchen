import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { AI_LABOR_MANAGER_ERA109_POLICY_ID } from "@/lib/ai/labor-manager-era109-policy";
import {
  AI_LABOR_MANAGER_ERA184_CANONICAL_POLICY_ID,
  AI_LABOR_MANAGER_ERA184_CAPABILITIES,
  AI_LABOR_MANAGER_ERA184_POLICY_ID,
  AI_LABOR_MANAGER_ERA184_ROUTE,
  AI_LABOR_MANAGER_ERA184_SERVICE,
  AI_LABOR_MANAGER_ERA184_SUMMARY_ARTIFACT,
  AI_LABOR_MANAGER_ERA184_WIRING_PATHS,
} from "@/lib/ai/labor-manager-era184-policy";
import {
  auditAiLaborManagerSmokeEra184Wiring,
  buildAiLaborManagerSmokeEra184Summary,
  resolveAiLaborManagerSmokeEra184ProofStatus,
} from "@/lib/ai/labor-manager-era184-smoke-summary";
import {
  AI_LABOR_MANAGER_POLICY_ID,
  AI_LABOR_MANAGER_SERVICE,
} from "@/lib/ai/labor-manager-policy";

const ROOT = process.cwd();

describe("ai labor manager era184", () => {
  it("locks era184 policy and artifact path", () => {
    expect(AI_LABOR_MANAGER_ERA184_POLICY_ID).toBe("era184-ai-labor-manager-v1");
    expect(AI_LABOR_MANAGER_ERA184_SUMMARY_ARTIFACT).toBe(
      "artifacts/ai-labor-manager-era184-smoke-summary.json",
    );
    expect(AI_LABOR_MANAGER_ERA184_ROUTE).toBe("/dashboard/staff/labor-manager");
    expect(AI_LABOR_MANAGER_ERA184_WIRING_PATHS).toHaveLength(5);
    expect(AI_LABOR_MANAGER_ERA184_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era184 with canonical AI Labor Manager policy", () => {
    expect(AI_LABOR_MANAGER_ERA184_CANONICAL_POLICY_ID).toBe(
      AI_LABOR_MANAGER_ERA109_POLICY_ID,
    );
    expect(AI_LABOR_MANAGER_ERA184_SERVICE).toBe(AI_LABOR_MANAGER_SERVICE);
    expect(AI_LABOR_MANAGER_POLICY_ID).toBe("ai-labor-manager-v1");
  });

  it("audits in-repo AI Labor Manager Round 2 wiring", () => {
    const audit = auditAiLaborManagerSmokeEra184Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of AI_LABOR_MANAGER_ERA184_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes staffing optimization and overtime alert wiring", () => {
    const service = readFileSync(join(ROOT, AI_LABOR_MANAGER_ERA184_SERVICE), "utf8");
    expect(service).toContain("loadLaborManagerSnapshot");
    expect(service).toContain("loadAiSchedulePlan");

    const builders = readFileSync(join(ROOT, "lib/ai/labor-manager-builders.ts"), "utf8");
    expect(builders).toContain("buildStaffingOptimizationSignals");
    expect(builders).toContain("buildOvertimeAlerts");
    expect(builders).toContain("buildLaborManagerDailyBrief");

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
      resolveAiLaborManagerSmokeEra184ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveAiLaborManagerSmokeEra184ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildAiLaborManagerSmokeEra184Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("staffing_optimization");
    expect(summary.capabilities).toContain("overtime_alerts");
    expect(summary.capabilities).toContain("daily_brief");
  });
});
