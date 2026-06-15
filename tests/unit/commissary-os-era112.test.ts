import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  COMMISSARY_OS_ERA112_CANONICAL_POLICY_ID,
  COMMISSARY_OS_ERA112_PILLARS,
  COMMISSARY_OS_ERA112_POLICY_ID,
  COMMISSARY_OS_ERA112_ROUTE,
  COMMISSARY_OS_ERA112_SERVICE,
  COMMISSARY_OS_ERA112_SUMMARY_ARTIFACT,
  COMMISSARY_OS_ERA112_WIRING_PATHS,
} from "@/lib/enterprise/commissary-os-era112-policy";
import {
  auditCommissaryOsSmokeWiring,
  buildCommissaryOsSmokeEra112Summary,
  resolveCommissaryOsSmokeEra112ProofStatus,
} from "@/lib/enterprise/commissary-os-smoke-summary";
import {
  ENTERPRISE_COMMISSARY_POLICY_ID,
  ENTERPRISE_COMMISSARY_SERVICE,
} from "@/lib/enterprise/commissary-policy";

const ROOT = process.cwd();

describe("commissary os era112", () => {
  it("locks era112 policy and artifact path", () => {
    expect(COMMISSARY_OS_ERA112_POLICY_ID).toBe("era112-commissary-os-v1");
    expect(COMMISSARY_OS_ERA112_SUMMARY_ARTIFACT).toBe(
      "artifacts/commissary-os-smoke-summary.json",
    );
    expect(COMMISSARY_OS_ERA112_ROUTE).toBe("/dashboard/enterprise/commissary");
    expect(COMMISSARY_OS_ERA112_PILLARS).toHaveLength(4);
  });

  it("aligns era112 with canonical commissary policy", () => {
    expect(COMMISSARY_OS_ERA112_CANONICAL_POLICY_ID).toBe(ENTERPRISE_COMMISSARY_POLICY_ID);
    expect(COMMISSARY_OS_ERA112_SERVICE).toBe(ENTERPRISE_COMMISSARY_SERVICE);
  });

  it("audits in-repo Commissary OS wiring", () => {
    const audit = auditCommissaryOsSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of COMMISSARY_OS_ERA112_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes four-pillar production purchasing delivery distribution wiring", () => {
    const service = readFileSync(join(ROOT, COMMISSARY_OS_ERA112_SERVICE), "utf8");
    expect(service).toContain("loadEnterpriseCommissaryDashboard");
    expect(service).toContain("getProductionCalendar");
    expect(service).toContain("listTransfers");

    const builders = readFileSync(join(ROOT, "lib/enterprise/commissary-builders.ts"), "utf8");
    expect(builders).toContain("buildProductionPillar");
    expect(builders).toContain("buildDistributionPillar");

    const panel = readFileSync(
      join(ROOT, "components/enterprise/commissary-enterprise-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("enterprise-commissary-panel");
    expect(panel).toContain("Commissary OS");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveCommissaryOsSmokeEra112ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveCommissaryOsSmokeEra112ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildCommissaryOsSmokeEra112Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.pillars).toContain("delivery");
  });
});
