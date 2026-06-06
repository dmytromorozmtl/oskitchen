import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  COMMAND_CENTER_ERA132_CANONICAL_POLICY_ID,
  COMMAND_CENTER_ERA132_LANES,
  COMMAND_CENTER_ERA132_POLICY_ID,
  COMMAND_CENTER_ERA132_ROUTE,
  COMMAND_CENTER_ERA132_SERVICE,
  COMMAND_CENTER_ERA132_SUMMARY_ARTIFACT,
  COMMAND_CENTER_ERA132_WIRING_PATHS,
} from "@/lib/command-center/command-center-era132-policy";
import {
  auditCommandCenterSmokeWiring,
  buildCommandCenterSmokeEra132Summary,
  resolveCommandCenterSmokeEra132ProofStatus,
} from "@/lib/command-center/command-center-smoke-summary";
import { COMMAND_CENTER_POLICY_ID } from "@/lib/command-center/command-center-policy";

const ROOT = process.cwd();

describe("command center era132", () => {
  it("locks era132 policy and artifact path", () => {
    expect(COMMAND_CENTER_ERA132_POLICY_ID).toBe("era132-command-center-v1");
    expect(COMMAND_CENTER_ERA132_SUMMARY_ARTIFACT).toBe(
      "artifacts/command-center-smoke-summary.json",
    );
    expect(COMMAND_CENTER_ERA132_ROUTE).toBe("/dashboard/command-center");
    expect(COMMAND_CENTER_ERA132_LANES).toHaveLength(5);
  });

  it("aligns era132 with canonical command center policy", () => {
    expect(COMMAND_CENTER_ERA132_CANONICAL_POLICY_ID).toBe(COMMAND_CENTER_POLICY_ID);
  });

  it("audits in-repo Command Center wiring", () => {
    const audit = auditCommandCenterSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of COMMAND_CENTER_ERA132_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes five-lane Bloomberg terminal wiring", () => {
    const service = readFileSync(join(ROOT, COMMAND_CENTER_ERA132_SERVICE), "utf8");
    expect(service).toContain("loadCommandCenterSnapshot");
    expect(service).toContain("loadExecutiveOverview");
    expect(service).toContain("loadForecasting2Snapshot");
    expect(service).toContain('id: "forecast"');
    expect(service).toContain("/dashboard/roles/owner");

    const builders = readFileSync(
      join(ROOT, "lib/command-center/command-center-builders.ts"),
      "utf8",
    );
    expect(builders).toContain("buildCommandCenterLane");
    expect(builders).toContain("FCST");

    const panel = readFileSync(
      join(ROOT, "components/command-center/command-center-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("command-center-panel");
    expect(panel).toContain("OS Kitchen Terminal");
    expect(panel).toContain("ALERTS");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveCommandCenterSmokeEra132ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveCommandCenterSmokeEra132ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildCommandCenterSmokeEra132Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.lanes).toContain("roles");
  });
});
